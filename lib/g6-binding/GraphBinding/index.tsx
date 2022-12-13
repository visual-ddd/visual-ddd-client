import React, { memo, useEffect, useId, useMemo, useRef } from 'react';
import cls from 'classnames';
import { Graph, Cell, CellView, Model } from '@antv/x6';
import type { Options } from '@antv/x6/lib/graph/options';
import { Noop, NoopArray } from '@wakeapp/utils';

import {
  CellInstance,
  GraphBindingContextHelper,
  GraphBindingContextValue,
  GraphBindingProvider,
  OnGraphReadyListener,
} from './GraphBindingContext';
import { useEventStore, wrapPreventListenerOptions } from '../hooks';

export interface GraphBindingProps {
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;

  /**
   * 画布初始化选项
   */
  options?: Partial<Options.Manual>;

  /**
   * 画布实例就绪
   * @param graph
   * @returns
   */
  onGraphReady?: (graph: Graph) => void;

  /**
   * 处理组件库拖入
   * @param evt
   * @returns
   */
  onDrop?: (evt: { componentData: Record<string, any>; nativeEvent: React.DragEvent; graph: Graph }) => void;

  /**
   * 开启嵌入，在开始拖动节点时触发
   * @param evt
   * @returns
   */
  onNode$Embed?: (evt: CellView.EventArgs['node:embed']) => void;

  /**
   * 寻找目标节点过程中触发
   * @param evt
   * @returns
   */
  onNode$Embedding?: (evt: CellView.EventArgs['node:embedding']) => void;

  /**
   * 完成节点嵌入后触发
   */
  onNode$Embedded?: (evt: CellView.EventArgs['node:embedded']) => void;

  /**
   * 父节点变更
   * @param evt
   * @returns
   */
  onCell$Change$Parent?: (evt: Model.EventArgs['cell:change:parent']) => void;
}

export { useGraphBinding } from './GraphBindingContext';

export const ALLOWED_DROP_SOURCE = '__from-component__';

const N = Noop;

/**
 * 画布
 */
export const GraphBinding = memo((props: GraphBindingProps) => {
  const { className, style, children, options, onGraphReady, onDrop, ...other } = props;
  const id = useId();
  const eventStore = useEventStore(other);
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<Graph>();
  const contextValue = useMemo(() => {
    let list: OnGraphReadyListener[] = [];
    let graph: Graph;
    let recycleBind: Map<string, { instance: CellInstance; createDate: number }> = new Map();

    type EventName = string;
    type CellID = string;
    const eventListeners: Map<EventName, Map<CellID, Function>> = new Map();

    const gc = () => {
      setTimeout(() => {
        const now = Date.now();
        const keysToRemove: string[] = [];

        for (const [key, instance] of recycleBind.entries()) {
          // 10s 过期回收
          if (now - instance.createDate >= 10000) {
            // 回收
            keysToRemove.push(key);
          }
        }

        if (keysToRemove.length) {
          for (const key of keysToRemove) {
            // 触发销毁
            recycleBind.get(key)?.instance.disposer();
            // 移除
            recycleBind.delete(key);
          }
        }

        if (recycleBind.size) {
          // 继续调度
          gc();
        }
      }, 5000);
    };

    const helper: GraphBindingContextHelper = {
      delegateEvent(eventName, handler, cellId) {
        if (!eventListeners.has(eventName)) {
          const list = new Map();
          eventListeners.set(eventName, list);
          // listen to graph
          graph.on(eventName, (evt: { cell: Cell }) => {
            const id = evt.cell.id;
            const handler = list.get(id);
            handler?.(evt);
          });
        }

        const list = eventListeners.get(eventName)!;
        list.set(cellId, handler);

        return () => {
          list.delete(cellId);
        };
      },
      recycle(id: string, instance) {
        if (!recycleBind.size) {
          // 垃圾回收调度
          gc();
        }

        recycleBind.set(id, { instance, createDate: Date.now() });
        // 隐藏
        instance.instance.setVisible(false, wrapPreventListenerOptions({}));
      },
      reuse(id) {
        const item = recycleBind.get(id);

        if (item != null) {
          recycleBind.delete(id);

          // 显示
          item.instance.instance.setVisible(true, wrapPreventListenerOptions({}));
          return item.instance as any;
        }

        return null;
      },
    };

    return {
      onGraphReady(listener) {
        // 已初始化
        if (graph) {
          requestAnimationFrame(() => {
            listener(graph, helper);
          });

          // FIXME: 为什么不能使用 Noop
          return N;
        }

        list.push(listener);

        return () => {
          const idx = list.indexOf(listener);
          if (idx !== -1) {
            list.splice(idx, 1);
          }
        };
      },
      // @ts-expect-error
      __emitGraph(g: Graph) {
        graph = g;
        const l = list;
        list = NoopArray;
        for (const i of l) {
          i(g, helper);
        }
      },
    } satisfies GraphBindingContextValue;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, NoopArray);

  const handleDragOver = (evt: React.DragEvent) => {
    evt.preventDefault();
    if (
      evt.dataTransfer.dropEffect !== 'copy' &&
      evt.dataTransfer.getData('text/plain').startsWith(ALLOWED_DROP_SOURCE)
    ) {
      evt.dataTransfer.dropEffect = 'copy';
    }
  };

  const handleDrop = (evt: React.DragEvent) => {
    const data = JSON.parse(evt.dataTransfer.getData('text/plain').slice(ALLOWED_DROP_SOURCE.length));
    evt.persist();
    onDrop?.({ componentData: data, nativeEvent: evt, graph: graphRef.current! });
  };

  useEffect(() => {
    const container = containerRef.current!;

    const graph = new Graph({
      container: container,
      ...options,
    });

    onGraphReady?.(graph);
    graphRef.current = graph;

    requestAnimationFrame(() => {
      contextValue.__emitGraph(graph);
    });

    const attachEvent = (name: string, handler: Function) => {
      graph.on(name, handler as any);
    };

    eventStore.listenDelegationChange(attachEvent);

    const delegations = eventStore.getDelegations();
    Object.keys(delegations).forEach(event => {
      attachEvent(event, delegations[event]);
    });

    return () => {
      graph.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className={cls('vd-graph-binding', className)}
      style={style}
      data-id={id}
      ref={containerRef}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <GraphBindingProvider value={contextValue}>{children}</GraphBindingProvider>
    </div>
  );
});

GraphBinding.displayName = 'GraphBinding';
