import { NodeBindingProps } from './types';
import { useNode } from './useNode';

export * from './types';

export const NodeBinding = (props: NodeBindingProps) => {
  useNode(props);
  return null;
};
