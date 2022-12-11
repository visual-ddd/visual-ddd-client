import { Graph, Node } from '@antv/x6';
import { useDeepEffect } from '@wakeapp/hooks';
import { MutableRefObject, useEffect } from 'react';

import { CellFactory, useCell } from '../CellBinding/useCell';
import { wrapPreventListenerOptions } from '../hooks';

import { NodeBindingProps } from './types';

const defaultFactory: CellFactory = (props: any, graph: Graph) => {
  const node = new Node(props) as any;
  graph.addNode(node);

  return {
    instance: node,
    disposer: () => {
      graph.removeNode(node);
    },
  };
};

export function useNode<Props extends NodeBindingProps>(props: Props, factor?: CellFactory) {
  const { size, position, angle } = props;
  const instanceRef = useCell(props, factor ?? defaultFactory) as MutableRefObject<Node>;

  useDeepEffect(() => {
    if (size != null) {
      instanceRef.current?.size(size, wrapPreventListenerOptions({}));
    }
  }, [size]);

  useDeepEffect(() => {
    if (position != null) {
      instanceRef.current?.position(position.x, position.y, wrapPreventListenerOptions({}));
    }
  }, [position]);

  useEffect(() => {
    if (angle != null) {
      instanceRef.current?.rotate(angle, wrapPreventListenerOptions({ absolute: true }));
    }
  }, [angle]);

  return instanceRef;
}
