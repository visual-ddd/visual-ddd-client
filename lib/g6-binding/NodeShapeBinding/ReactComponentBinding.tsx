import React, { memo, FC } from 'react';
import { register } from '@antv/x6-react-shape';
import { Graph, Node } from '@antv/x6';

import { CellFactory } from '../CellBinding/useCell';
import { NodeBindingProps } from '../NodeBinding';
import { useNode } from '../NodeBinding/useNode';
import { CellContextProvider } from '../CellBinding/context';

export interface ReactComponentBindingProps extends NodeBindingProps {
  /**
   * 指定预先注册的 React 组件
   */
  component: string;
}

export interface ReactComponentProps {
  node: Node;
  graph: Graph;
}

export type ReactDecorator = (child: FC<ReactComponentProps>) => FC<ReactComponentProps>;

const decorators: Map<string, ReactDecorator> = new Map();

/**
 * 注册装饰器
 * @param name
 */
export function registerReactDecorator(name: string, component: ReactDecorator) {
  if (decorators.has(name)) {
    throw new Error(`ReactDecorator(${name}) already registered`);
  }

  decorators.set(name, component);
}

/**
 * 装饰器应用
 */
function applyDecorator(component: FC<ReactComponentProps>) {
  let output = component;

  const reversed = Array.from(decorators.entries()).reverse();
  for (const [name, dec] of reversed) {
    const originName = output.displayName;
    output = dec(output);
    output.displayName = `${name}${originName ? `(${originName})` : ''}`;
  }

  return output;
}

/**
 * 注册 React 组件
 * @param name
 * @param component
 */
export function registerReactComponent(name: string, component: FC<ReactComponentProps>) {
  register({
    shape: name,
    component: applyDecorator(component),
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
      graph.removeNode(instance);
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
