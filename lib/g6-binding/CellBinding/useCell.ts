import { useEffect, useMemo, useRef } from 'react';
import { Disposer } from '@wakeapp/utils';
import { useRefValue } from '@wakeapp/hooks';
import { Cell, Graph } from '@antv/x6';
import memoize from 'lodash/memoize';
import omitBy from 'lodash/omitBy';

import { makeSet } from '@/lib/utils';

import { useGraphBinding } from '../GraphBinding';

import { CellBindingProps, CellContextValue } from './types';
import { useEventStore, wrapPreventListenerOptions } from '../hooks';
import { useCellContext } from './context';
import { CellUpdater } from './CellUpdater';

export type CellFactory = (
  props: any,
  graph: Graph
) => {
  instance: any;
  disposer: () => void;
};

const defaultFactory: CellFactory = (props, graph) => {
  const instance = new Cell(props);

  graph.addCell(instance);

  return {
    instance,
    disposer: () => graph.removeCell(instance),
  };
};

type Prefix = string;
const delegateToGraphEvents: [Set<string>, Prefix][] = [
  [
    makeSet(
      'click,dblclick,contextmenu,mousedown,mousemove,mouseup,mouseover,mouseout,mouseenter,mouseleave,mousewheel,highlight,unhighlight'
    ),
    'cell',
  ],
  [makeSet('embed,embedding,embedded'), 'node'],
];

const OMIT_PROPS = makeSet('children,model');

const getDelegateEventName = memoize((name: string) => {
  for (const [set, prefix] of delegateToGraphEvents) {
    if (set.has(name)) {
      return `${prefix}:${name}`;
    }
  }

  return null;
});

const PREVENT_LISTENER_NOOP_OBJECT = wrapPreventListenerOptions({});

/**
 * @param cell
 * @param parentZIndex
 */
const incrementCellZIndex = (cell: Cell, parentZIndex: number) => {
  let zIndex = cell.getZIndex()!;

  if (zIndex > parentZIndex) {
    // 无需处理
    return;
  }

  zIndex++;

  // 递归更新
  const children = cell.getChildren();
  if (children?.length) {
    for (const child of children) {
      incrementCellZIndex(child, zIndex);
    }
  }

  cell.setZIndex(zIndex);
};

export function useCellContextValue() {
  const value = useMemo(() => {
    let children: Cell[] = [];
    let parent: Cell;

    const embed = (child: Cell) => {
      // 矫正 zIndex
      const parentZIndex = parent.getZIndex()!;
      incrementCellZIndex(child, parentZIndex);

      parent.embed(child, PREVENT_LISTENER_NOOP_OBJECT);
      console.log('add child', parent, child);
    };
    const unembed = (child: Cell) => {
      console.log('remove child', parent, child);
      parent.unembed(child, PREVENT_LISTENER_NOOP_OBJECT);
    };

    return {
      addChild(child) {
        if (parent) {
          embed(child);

          return () => {
            unembed(child);
          };
        }

        // 未就绪
        children.push(child);

        return () => {
          if (parent) {
            unembed(child);
          } else {
            const idx = children.indexOf(child);
            if (idx !== -1) {
              children.splice(idx, 1);
            }
          }
        };
      },
      // @ts-expect-error
      get __hasChildren() {
        return !!children.length;
      },
      // 父节点就绪
      __emitParentReady(cell: Cell) {
        parent = cell;
        const clone = children;
        children = [];
        for (const item of clone) {
          embed(item);
        }
      },
    } satisfies CellContextValue;
  }, []);

  return value;
}

export function useCell<Props extends CellBindingProps>({
  props,
  factor,
  canBeChild,
  canBeParent,
  onCellReady,
  PropertyUpdater,
}: {
  props: Props;

  /**
   * 实例创建工厂
   */
  factor?: CellFactory;

  /**
   * 节点就绪
   * @param cell
   * @returns
   */
  onCellReady?: (cell: Cell) => void;

  /**
   * 属性更新器
   */
  PropertyUpdater?: typeof CellUpdater;

  /**
   * 是否支持作为分组容器, 默认 false
   */
  canBeParent?: boolean;

  /**
   * 是否支持作为分组子节点，默认 false
   */
  canBeChild?: boolean;
}) {
  const parent = useCellContext();
  const contextValue = useCellContextValue();
  const eventStore = useEventStore(props);
  const propsRef = useRefValue(props);
  const instanceRef = useRef<Cell>();
  const graphContext = useGraphBinding();
  const updater = useMemo(() => {
    const ctor = PropertyUpdater ?? CellUpdater;
    return new ctor(instanceRef);
  }, []);

  useEffect(() => {
    const disposers = new Disposer();
    disposers.push(
      graphContext.onGraphReady((graph, helper) => {
        const f = factor ?? defaultFactory;
        const { id } = propsRef.current;

        // 尽量复用旧的实例，避免增删
        const recoveredInstance = id ? helper.reuse(id) : undefined;

        const factoryInstance =
          recoveredInstance ||
          f(
            omitBy(propsRef.current, (v, k) => {
              if (OMIT_PROPS.has(k)) {
                return true;
              }

              return false;
            }),
            graph
          );
        const instance = factoryInstance.instance as Cell;
        instanceRef.current = instance as Cell;
        helper.created(instance);

        console.log('creating', recoveredInstance ? 'reuse' : '', instance);

        // 恢复的实例，需要重新更新
        if (recoveredInstance) {
          updater.accept(propsRef.current);
        } else {
          // 仅更新 data, 这个是引用数据
          updater.accept({ data: propsRef.current.data });
        }

        disposers.push(() => {
          console.log('disposing', instance);
          helper.destroyed(instance);
          // 回收
          helper.recycle(instance.id, factoryInstance);
        });

        // 分组关系
        {
          if (parent && canBeChild) {
            // 注册子节点
            disposers.push(parent.addChild(instance));
          }

          // 添加子节点
          if (canBeParent) {
            contextValue.__emitParentReady(instance);
          } else if (contextValue.__hasChildren) {
            throw new Error(`当前节点不能作为分组`);
          }
        }

        {
          // 订阅事件
          const attachEvent = (name: string, handler: Function) => {
            const delegateEventName = getDelegateEventName(name);
            if (delegateEventName) {
              // 代理到 graph
              disposers.push(helper.delegateEvent(delegateEventName, handler, instance.id));
            } else {
              instance.on(name, handler as any);
            }
          };

          eventStore.listenDelegationChange(attachEvent);

          const delegations = eventStore.getDelegations();
          Object.keys(delegations).forEach(event => {
            attachEvent(event, delegations[event]);
          });
        }

        // ready
        {
          onCellReady?.(instance);
          propsRef.current?.onCellReady?.(instance);
        }
      })
    );

    return disposers.release;
  }, []);

  // 监听属性变动

  updater.accept(props);

  return { instanceRef, contextValue };
}
