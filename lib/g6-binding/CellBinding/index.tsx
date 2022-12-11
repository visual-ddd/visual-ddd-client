import { useCell } from './useCell';
import { CellBindingProps } from './types';

export * from './types';

/**
 * Cell
 * Cell 是 Node 和 Edge 的父类, 通常你不会直接使用它
 */
export const CellBinding = (props: CellBindingProps) => {
  useCell(props);
  return null;
};
