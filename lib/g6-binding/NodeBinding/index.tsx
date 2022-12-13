import { CellContextProvider } from '../CellBinding/context';
import { NodeBindingProps } from './types';
import { useNode } from './useNode';

export * from './types';

export const NodeBinding = (props: NodeBindingProps) => {
  const { canBeParent = true } = props;
  const { contextValue } = useNode({ props, canBeParent });

  if (canBeParent) {
    return <CellContextProvider value={contextValue}>{props.children}</CellContextProvider>;
  } else {
    return null;
  }
};
