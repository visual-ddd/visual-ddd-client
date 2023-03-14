import { useMemo } from 'react';
import { MermaidComponent } from './MermaidComponent';

import { MindMapNode } from './types';
import { mindMapNodeToMermaidCode } from './utils';

export interface MindMapProps extends React.HTMLAttributes<HTMLDivElement> {
  tree: MindMapNode;
}

/**
 * 思维导图渲染
 * @param props
 * @returns
 */
export const MindMap = (props: MindMapProps) => {
  const { tree, ...other } = props;
  const code = useMemo(() => mindMapNodeToMermaidCode(tree), [tree]);

  return <MermaidComponent code={code} {...other} />;
};
