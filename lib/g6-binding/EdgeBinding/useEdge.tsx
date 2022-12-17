import { Cell, Edge, Graph } from '@antv/x6';
import { MutableRefObject } from 'react';
import { NoopArray } from '@wakeapp/utils';

import { CellFactory, useCell } from '../CellBinding/useCell';
import { wrapPreventListenerOptions } from '../hooks';

import { EdgeBindingProps } from './types';
import { CellUpdater } from '../CellBinding/CellUpdater';

const defaultFactory: CellFactory = (props: any, graph: Graph) => {
  const instance = graph.addEdge(props);

  return {
    instance: instance,
    disposer: () => {
      graph.removeEdge(instance);
    },
  };
};

function isCell(node: any): node is Cell<Cell.Properties> {
  return node != null && typeof node === 'object' && 'isCell' in node && node.isCell();
}

function toTerminalData(source: Edge.Metadata['source']): Edge.TerminalData | undefined {
  if (source == null) {
    return undefined;
  }
  return typeof source === 'string' || isCell(source)
    ? { cell: source }
    : Array.isArray(source)
    ? { x: source[0], y: source[1] }
    : source;
}

class EdgeUpdater<T extends Edge = Edge> extends CellUpdater<T> {
  get source() {
    return this.instance.current?.getSource();
  }

  set source(source) {
    this.instance.current?.setSource(toTerminalData(source)!, wrapPreventListenerOptions({}));
  }

  get target() {
    return this.instance.current?.getTarget();
  }

  set target(target) {
    this.instance.current?.setTarget(toTerminalData(target)!, wrapPreventListenerOptions({}));
  }

  get label() {
    return this.instance.current?.getAttrByPath('text/text');
  }

  set label(value: any) {
    this.instance.current?.setAttrByPath('text/text', value, wrapPreventListenerOptions({}));
  }

  get router() {
    return this.instance.current?.getRouter();
  }

  set router(value: any) {
    if (value === undefined) {
      this.instance.current?.removeRouter(wrapPreventListenerOptions({}));
    } else {
      this.instance.current?.setRouter(value, wrapPreventListenerOptions({}));
    }
  }

  get vertices() {
    return this.instance.current?.getVertices();
  }

  set vertices(value: any) {
    this.instance.current?.setVertices(value ?? NoopArray, wrapPreventListenerOptions({}));
  }

  get connector() {
    return this.instance.current?.getConnector();
  }

  set connector(value: any) {
    if (value === undefined) {
      this.instance.current?.removeConnector(wrapPreventListenerOptions({}));
    } else {
      this.instance.current?.setConnector(value, wrapPreventListenerOptions({}));
    }
  }

  get labels() {
    return this.instance.current?.getLabels();
  }

  set labels(value: any) {
    this.instance.current?.setLabels(value ?? NoopArray, wrapPreventListenerOptions({}));
  }

  private edgeKeys = ['source', 'target', 'label', 'router', 'vertices', 'connector', 'labels'];

  accept(props: Record<string, any>): void {
    super.accept(props);

    for (const key of this.edgeKeys) {
      this.doUpdate(key, props[key], { object: props });
    }
  }
}

export function useEdge<Props extends EdgeBindingProps>({
  props,
  factor,
  PropertyUpdater,
}: {
  props: Props;
  factor?: CellFactory;
  PropertyUpdater?: typeof EdgeUpdater;
}) {
  const instanceRef = useCell({
    props,
    factor: factor ?? defaultFactory,
    canBeChild: false,
    canBeParent: false,
    PropertyUpdater: (PropertyUpdater ?? EdgeUpdater) as typeof CellUpdater,
  }).instanceRef as MutableRefObject<Edge>;

  return instanceRef;
}
