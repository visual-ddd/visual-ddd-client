import { Shape } from '@antv/x6';
import { useEffect } from 'react';

import { CellFactory } from '../CellBinding/useCell';
import { wrapPreventListenerOptions } from '../hooks';
import { NodeBindingProps } from '../NodeBinding';
import { useNode } from '../NodeBinding/useNode';

function createShape<Props extends NodeBindingProps>(Shape: any, properties: Array<[string, string]>, name: string) {
  const factory: CellFactory = (props, graph) => {
    const instance = new Shape(props);
    graph.addNode(instance);

    return {
      instance,
      disposer: () => {
        graph.removeNode(instance);
      },
    };
  };

  function Comp(props: Props) {
    const instance = useNode(props, factory);

    for (const [prop, propUpdator] of properties) {
      const value = (props as any)[prop];
      // eslint-disable-next-line react-hooks/rules-of-hooks
      useEffect(() => {
        if (value != null) {
          (instance.current as any)?.[propUpdator](value, wrapPreventListenerOptions({}));
        }
      }, [value]);
    }

    return null;
  }

  Comp.displayName = name;

  return Comp;
}

export const RectBinding = createShape<NodeBindingProps & { label?: string }>(
  Shape.Rect,
  [['label', 'setLabel']],
  'RectBinding'
);
