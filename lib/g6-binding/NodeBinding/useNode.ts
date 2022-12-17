import { Graph, Node } from '@antv/x6';
import { MutableRefObject } from 'react';
import { CellUpdater } from '../CellBinding/CellUpdater';

import { CellFactory, useCell } from '../CellBinding/useCell';
import { wrapPreventListenerOptions } from '../hooks';

import { NodeBindingProps } from './types';

const defaultFactory: CellFactory = (props: any, graph: Graph) => {
  const node = new Node(props);
  graph.addNode(node);

  return {
    instance: node,
    disposer: () => {
      graph.removeNode(node);
    },
  };
};

export class NodeUpdater<T extends Node = Node> extends CellUpdater<T> {
  private nodeKeys = ['angle'];
  private nodeKeysDeepCompare = ['size', 'position', 'angle'];

  get size() {
    return this.instance.current!.getSize();
  }

  set size(value: any) {
    // size 总是存在
    this.instance.current?.size(value, wrapPreventListenerOptions({}));
  }

  get position() {
    return this.instance.current!.getPosition();
  }

  set position(value: any) {
    // position 总是存在
    this.instance.current?.position(value.x, value.y, wrapPreventListenerOptions({}));
  }

  get angle() {
    return this.instance.current!.getAngle();
  }

  set angle(angle: number) {
    this.instance.current?.rotate(angle ?? 0, wrapPreventListenerOptions({ absolute: true }));
  }

  accept(props: Record<string, any>): void {
    super.accept(props);

    for (const key of this.nodeKeys) {
      this.doUpdate(key, props[key], { object: props });
    }

    for (const key of this.nodeKeysDeepCompare) {
      this.doUpdate(key, props[key], { deep: true, object: props });
    }
  }
}

export function useNode<Props extends NodeBindingProps>({
  props,
  factory,
  canBeParent = true,
  PropertyUpdater,
}: {
  props: Props;
  factory?: CellFactory;
  PropertyUpdater?: typeof NodeUpdater;
  canBeParent?: boolean;
}) {
  const ctx = useCell({
    props,
    factor: factory ?? defaultFactory,
    canBeChild: true,
    canBeParent,
    PropertyUpdater: (PropertyUpdater ?? NodeUpdater) as typeof CellUpdater,
  });
  const instanceRef = ctx.instanceRef as MutableRefObject<Node>;
  const contextValue = ctx.contextValue;

  return { instanceRef, contextValue };
}
