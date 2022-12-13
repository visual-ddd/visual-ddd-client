import { useEffect } from 'react';
import { CellContextProvider } from '../CellBinding/context';

import { CellFactory } from '../CellBinding/useCell';
import { wrapPreventListenerOptions } from '../hooks';
import { NodeBindingProps } from '../NodeBinding';
import { useNode } from '../NodeBinding/useNode';

export function createShape<Props extends NodeBindingProps>(
  Shape: any,
  properties: Array<[string, string]>,
  name: string
) {
  const factory: CellFactory = (props, graph) => {
    const instance = new Shape(props);
    graph.addNode(instance);

    return {
      instance,
      disposer: () => {
        console.log('real dispose');
        graph.removeNode(instance, wrapPreventListenerOptions({}));
      },
    };
  };

  function Comp(props: Props) {
    const { canBeParent = true } = props;
    const { instanceRef, contextValue } = useNode({ props, factory, canBeParent });

    for (const [prop, propUpdator] of properties) {
      const value = (props as any)[prop];
      // eslint-disable-next-line react-hooks/rules-of-hooks
      useEffect(() => {
        if (value != null) {
          (instanceRef.current as any)?.[propUpdator](value, wrapPreventListenerOptions({}));
        }
      }, [value]);
    }

    if (canBeParent) {
      return <CellContextProvider value={contextValue}>{props.children}</CellContextProvider>;
    } else {
      return null;
    }
  }

  Comp.displayName = name;

  return Comp;
}
