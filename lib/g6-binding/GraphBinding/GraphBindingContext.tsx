import { Graph, Cell } from '@antv/x6';
import { createContext, useContext } from 'react';

export type Disposer = () => void;

export type CellInstance<T extends Cell = Cell> = {
  instance: T;
  disposer: Disposer;
};

export interface GraphBindingContextHelper {
  /**
   * 代理事件
   * 因为 部分事件仅在 Graph 才能监听到，子节点通过这个方法来代理事件
   * @returns
   */
  delegateEvent: (eventName: string, handler: Function, cellId: string) => Disposer;

  /**
   * 图形实例回收
   * 这主要是为了避免频繁增删节点。VDOM 节点的移动避免无意义的增删
   * 被回收的节点的节点会被定时移除
   */
  recycle: (id: string, instance: CellInstance) => void;

  /**
   * 图形实例复用
   */
  reuse: <T extends Cell = Cell>(id: string) => CellInstance<T> | null;
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
