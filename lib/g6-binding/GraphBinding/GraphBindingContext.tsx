import { Graph } from '@antv/x6';
import { createContext, useContext } from 'react';

export type Disposer = () => void;

export interface GraphBindingContextHelper {
  /**
   * 代理事件
   * 因为 部分事件仅在 Graph 才能监听到，子节点通过这个方法来代理事件
   * @returns
   */
  delegateEvent: (eventName: string, handler: Function, cellId: string) => Disposer;
}

export type OnGraphReadyListener = (graph: Graph, helper: GraphBindingContextHelper) => void;

export interface GraphBindingContextValue {
  onGraphReady: (listener: OnGraphReadyListener) => Disposer;
}

/**
 * 画布上下文
 */
const Context = createContext<GraphBindingContextValue | null>(null);
Context.displayName = 'GraphBindingContext';

export function useGraphBinding() {
  const c = useContext(Context);
  if (c == null) {
    throw new Error(`useGraphBinding 必须在 GraphBinding 作用域下调用`);
  }

  return c;
}

export const GraphBindingProvider = Context.Provider;
