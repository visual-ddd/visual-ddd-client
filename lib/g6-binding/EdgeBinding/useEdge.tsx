import { Cell, Edge, Graph } from '@antv/x6';
import { useDeepEffect } from '@wakeapp/hooks';
import { MutableRefObject, useEffect } from 'react';
import upperFirst from 'lodash/upperFirst';

import { CellFactory, useCell } from '../CellBinding/useCell';
import { wrapPreventListenerOptions } from '../hooks';

import { EdgeBindingProps } from './types';

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
  return node != null && typeof node === 'object' && node.isCell();
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

export function useEdge<Props extends EdgeBindingProps>(props: Props, factor?: CellFactory) {
  const { source, target, label } = props;
  const instanceRef = useCell(props, factor ?? defaultFactory) as MutableRefObject<Edge>;

  useDeepEffect(() => {
    if (source != null) {
      instanceRef.current?.setSource(toTerminalData(source)!, wrapPreventListenerOptions({}));
    }
  }, [source]);

  useDeepEffect(() => {
    if (target != null) {
      instanceRef.current?.setTarget(toTerminalData(target)!, wrapPreventListenerOptions({}));
    }
  }, [target]);

  useEffect(() => {
    if (label != null) {
      instanceRef.current?.setAttrByPath('text/text', label, wrapPreventListenerOptions({}));
    }
  }, [label]);

  ['router', 'vertices', 'connector', 'labels'].forEach(key => {
    const value = (props as any)[key];
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useDeepEffect(() => {
      if (value != null) {
        (instanceRef.current as any)?.[`set${upperFirst(key)}`](value, wrapPreventListenerOptions({}));
      }
    }, [value]);
  });

  return instanceRef;
}
