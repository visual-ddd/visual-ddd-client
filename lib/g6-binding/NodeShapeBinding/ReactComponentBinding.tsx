import React, { memo, createContext, useContext, FC } from 'react';
import { register } from '@antv/x6-react-shape';
import { Graph, Node } from '@antv/x6';

import { CellFactory } from '../CellBinding/useCell';
import { NodeBindingProps } from '../NodeBinding';
import { useNode } from '../NodeBinding/useNode';
import { CellContextProvider } from '../CellBinding/context';
import { wrapPreventListenerOptions } from '../hooks';

export interface ReactComponentBindingProps extends NodeBindingProps {
  /**
   * 指定预先注册的 React 组件
   */
  component: string;
}

export interface X6ReactComponentProps {
  node: Node;
  graph: Graph;
}

export function registerX6ReactComponent(name: string, component: FC<X6ReactComponentProps>) {
  register({
    shape: name,
    component: component,
  });
}

const factory: CellFactory = (props, graph) => {
  const instance = graph.addNode({
    ...props,
    shape: props.component,
  });

  return {
    instance,
    disposer: () => {
      graph.removeNode(instance, wrapPreventListenerOptions({}));
    },
  };
};

export const ReactComponentBinding = memo((props: ReactComponentBindingProps) => {
  const { canBeParent = true } = props;
  const { contextValue } = useNode({ props, factory, canBeParent });

  if (canBeParent) {
    return <CellContextProvider value={contextValue}>{props.children}</CellContextProvider>;
  } else {
    return null;
  }
});

ReactComponentBinding.displayName = 'ReactComponentBinding';
