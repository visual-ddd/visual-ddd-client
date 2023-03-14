import { NoopArray } from '@wakeapp/utils';
import { Empty } from 'antd';
import { memo, useMemo } from 'react';
import { MermaidContainer, MindMap, MindMapNode } from '@/lib/components/Mermaid';
import type { BusinessDomainDSL } from '@/modules/domain/api/dsl/interface';

import { DomainDetail } from '../types';

export interface GraphProps extends React.HTMLAttributes<HTMLDivElement> {
  detail: DomainDetail;
  dsl?: BusinessDomainDSL;
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
      name: `《业务域》<br>${detail.name}`,
      shape: 'circle',
      children: [],
    };

    // 数据对象
    if (dsl.dataModel.dataObjects.length) {
      const dataObjectNode: MindMapNode = {
        name: '《数据对象》',
        children: [],
      };

      root.children?.push(dataObjectNode);

      for (const dataObject of dsl.dataModel.dataObjects) {
        dataObjectNode.children?.push({
          name: stringifyName(dataObject),
          shape: 'square',
        });
      }
    }

    if (dsl.queryModel.queries.length) {
      const queryNode: MindMapNode = {
        name: '《查询》',
        children: [],
      };

      root.children?.push(queryNode);

      for (const query of dsl.queryModel.queries) {
        queryNode.children?.push({
          name: stringifyName(query),
          shape: 'rounded-square',
        });
      }
    }

    if (dsl.domainModel.aggregates.length) {
      const aggregations = dsl.domainModel.aggregates;
      const aggregatesNode: MindMapNode = {
        name: '《聚合》',
        children: [],
      };

      root.children?.push(aggregatesNode);

      for (const aggregation of aggregations) {
        const aggregateNode: MindMapNode = {
          name: stringifyName(aggregation),
          shape: 'hexagon',
          children: [],
        };
        aggregatesNode.children?.push(aggregateNode);

        if (aggregation.commands.length) {
          const commandNode: MindMapNode = {
            name: '《命令》',
            children: [],
          };

          aggregateNode.children?.push(commandNode);

          for (const command of aggregation.commands) {
            commandNode.children?.push({
              name: stringifyName(command),
              shape: 'square',
            });
          }
        }

        if (aggregation.entities?.length) {
          const entityNode: MindMapNode = {
            name: '《实体》',
            children: [],
          };

          aggregateNode.children?.push(entityNode);

          for (const entity of aggregation.entities ?? NoopArray) {
            entityNode.children?.push({
              name: stringifyName(entity),
              shape: 'square',
            });
          }
        }

        // 聚合根
        aggregateNode.children?.push({
          name: `《聚合根》<br>${stringifyName(aggregation.root)}`,
        });
      }
    }

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
