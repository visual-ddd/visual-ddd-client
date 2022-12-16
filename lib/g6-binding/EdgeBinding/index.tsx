import { memo } from 'react';
import { EdgeBindingProps } from './types';
import { useEdge } from './useEdge';

export * from './types';

export const EdgeBinding = memo((props: EdgeBindingProps) => {
  useEdge({ props });

  return null;
});

EdgeBinding.displayName = 'EdgeBinding';
