import { useEffect, useMemo, useRef } from 'react';
import { Disposer } from '@wakeapp/utils';
import { useDeepEffect, useRefValue } from '@wakeapp/hooks';
import { Cell, Graph } from '@antv/x6';
import memoize from 'lodash/memoize';

import { makeSet } from '@/lib/utils';

import { useGraphBinding } from '../GraphBinding';

import { CellBindingProps, CellContextValue } from './types';
import { useEventStore, wrapPreventListenerOptions } from '../hooks';
import { useCellContext } from './context';

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
    disposer: () => graph.removeCell(instance, wrapPreventListenerOptions({})),
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

const getDelegateEventName = memoize((name: string) => {
  for (const [set, prefix] of delegateToGraphEvents) {
    if (set.has(name)) {
      return `${prefix}:${name}`;
    }
  }

  return null;
});

const PREVENT_LISTENER_NOOP_OBJECT = wrapPreventListenerOptions({});

export function useCellContextValue() {
  const value = useMemo(() => {
    let children: Cell[] = [];
    let parent: Cell;

    return {
      addChild(child) {
        if (parent) {
          parent.addChild(child, PREVENT_LISTENER_NOOP_OBJECT);

          return () => {
            parent.removeChild(child, PREVENT_LISTENER_NOOP_OBJECT);
          };
        }

        // 未就绪
        children.push(child);

        return () => {
          if (parent) {
            parent.removeChild(child, PREVENT_LISTENER_NOOP_OBJECT);
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
          parent.addChild(item, PREVENT_LISTENER_NOOP_OBJECT);
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
}: {
  props: Props;
  factor?: CellFactory;

  onCellReady?: (cell: Cell) => void;

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
  const { attrs, zIndex, visible, data } = props;

  useEffect(() => {
    const disposers = new Disposer();
    disposers.push(
      graphContext.onGraphReady((graph, helper) => {
        const f = factor ?? defaultFactory;
        const id = propsRef.current.id;

        console.log('creating');

        // 尽量复用旧的实例，避免增删
        const factoryInstance = (id ? helper.reuse(id) : undefined) || f(propsRef.current, graph);
        const instance = factoryInstance.instance as Cell;

        disposers.push(() => {
          console.log('disposing');
          // 回收
          helper.recycle(instance.id, factoryInstance);
        });

        instanceRef.current = instance as Cell;

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
        onCellReady?.(instance);
        propsRef.current?.onCellReady?.(instance);
      })
    );

    return disposers.release;
  }, []);

  // 监听属性变动
  useDeepEffect(() => {
    if (attrs != null) {
      instanceRef.current?.setAttrs(attrs, wrapPreventListenerOptions({ deep: true }));
    }
  }, [attrs]);

  useEffect(() => {
    if (zIndex != null) {
      instanceRef.current?.setZIndex(zIndex, wrapPreventListenerOptions({}));
    }
  }, [zIndex]);

  useEffect(() => {
    if (visible != null) {
      instanceRef.current?.setVisible(visible, wrapPreventListenerOptions({}));
    }
  }, [visible]);

  useDeepEffect(() => {
    if (data != null) {
      instanceRef.current?.setData(data, { silent: true, deep: false, overwrite: true });
    }
  }, [data]);

  return { instanceRef, contextValue };
}
