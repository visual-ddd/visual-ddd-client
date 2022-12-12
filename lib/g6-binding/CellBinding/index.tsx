import { useCell } from './useCell';
import { CellBindingProps } from './types';
import { CellContextProvider } from './context';

export * from './types';

/**
 * Cell
 * Cell 是 Node 和 Edge 的父类, 通常你不会直接使用它
 */
export const CellBinding = (props: CellBindingProps) => {
  const { contextValue } = useCell({ props, canBeChild: true, canBeParent: true });

  return <CellContextProvider value={contextValue}>{props.children}</CellContextProvider>;
};
