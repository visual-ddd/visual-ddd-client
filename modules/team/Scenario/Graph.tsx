import { Empty } from 'antd';
import { memo, useMemo } from 'react';
import { MermaidContainer, MindMap, MindMapNode } from '@/lib/components/Mermaid';
import type { ScenarioDSL } from '@/modules/scenario/api/dsl/interface';

import { ScenarioDetail } from '../types';

export interface GraphProps extends React.HTMLAttributes<HTMLDivElement> {
  detail: ScenarioDetail;
  dsl?: ScenarioDSL;
}

function stringifyName(node: { name: string; title?: string }) {
  return node.title ? `${node.title}<br>${node.name}` : node.name;
}

export const Graph = memo((props: GraphProps) => {
  const { dsl, detail, ...other } = props;

  const tree = useMemo<MindMapNode | undefined>(() => {
    if (dsl == null) {
      return;
    }

    const root: MindMapNode = {
      name: `《业务场景》<br>${detail.name}`,
      shape: 'circle',
      children: [],
    };

    if (dsl.serviceModel.queries.length) {
      const service: MindMapNode = {
        name: '《服务》',
        children: [],
      };

      root.children?.push(service);

      for (const query of dsl.serviceModel.queries) {
        service.children?.push({
          name: stringifyName(query),
          shape: 'rounded-square',
        });
      }
    }

    // TODO: 业务域

    return root;
  }, [dsl, detail]);

  if (tree == null) {
    return <Empty description="暂无数据" />;
  }

  return (
    <MermaidContainer>
      <MindMap tree={tree} {...other} />
    </MermaidContainer>
  );
});

Graph.displayName = 'Graph';

export default Graph;
