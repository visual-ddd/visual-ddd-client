import { CellContextProvider } from '../CellBinding/context';
import { NodeBindingProps } from './types';
import { useNode } from './useNode';

export * from './types';

export const NodeBinding = (props: NodeBindingProps) => {
  const { contextValue } = useNode({ props });

  return <CellContextProvider value={contextValue}>{props.children}</CellContextProvider>;
};
