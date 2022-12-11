import React, { useEffect, useId, useMemo, useRef } from 'react';
import cls from 'classnames';
import { Graph, Cell } from '@antv/x6';
import type { Options } from '@antv/x6/lib/graph/options';
import { Noop, NoopArray } from '@wakeapp/utils';

import {
  GraphBindingContextHelper,
  GraphBindingContextValue,
  GraphBindingProvider,
  OnGraphReadyListener,
} from './GraphBindingContext';
import { useEventStore } from '../hooks';

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
}

export { useGraphBinding } from './GraphBindingContext';

/**
 * 画布
 */
export const GraphBinding = (props: GraphBindingProps) => {
  const { className, style, children, options, onGraphReady } = props;
  const id = useId();
  const eventStore = useEventStore(props);
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<Graph>();
  const contextValue = useMemo(() => {
    let list: OnGraphReadyListener[] = [];
    let graph: Graph;

    type EventName = string;
    type CellID = string;
    const eventListeners: Map<EventName, Map<CellID, Function>> = new Map();

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
    };

    return {
      onGraphReady(listener) {
        // 已初始化
        if (graph) {
          requestAnimationFrame(() => {
            listener(graph, helper);
          });

          return Noop;
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
    <div className={cls('vd-graph-binding', className)} style={style} data-id={id} ref={containerRef}>
      <GraphBindingProvider value={contextValue}>{children}</GraphBindingProvider>
    </div>
  );
};
