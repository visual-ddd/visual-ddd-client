import { Empty } from 'antd';
import { useMemo } from 'react';
import { observer } from 'mobx-react';
import { MermaidContainer, MindMap, MindMapNode } from '@/lib/components/Mermaid';
import type { ScenarioDSL } from '@/modules/scenario/api/dsl/interface';
import { booleanPredicate, NoopArray } from '@wakeapp/utils';
import uniq from 'lodash/uniq';

import { ScenarioDetail } from '../types';
import { useTeamLayoutModel } from '../TeamLayout';

export interface GraphProps extends React.HTMLAttributes<HTMLDivElement> {
  detail: ScenarioDetail;
  dsl?: ScenarioDSL;
}

function stringifyName(node: { name: string; title?: string }) {
  return node.title ? `${node.title}<br>${node.name}` : node.name;
}

export const Graph = observer(function Graph(props: GraphProps) {
  const { dsl, detail, ...other } = props;

  const layoutModel = useTeamLayoutModel();

  const domains = useMemo(() => {
    const domainIds = uniq(
      dsl?.domainDependencies.filter(i => !i.teamId && i.domainId).map(i => i.domainId) ?? NoopArray
    );

    return domainIds
      ?.map(domainId => {
        const domain = layoutModel?.domainList.find(i => i.id === domainId);

        return domain;
      })
      .filter(booleanPredicate);
  }, [layoutModel?.domainList, dsl?.domainDependencies]);

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

    if (domains?.length) {
      const domain: MindMapNode = {
        name: '《业务域》',
        children: [],
      };

      root.children?.push(domain);

      for (const domainItem of domains) {
        domain.children?.push({
          name: stringifyName(domainItem),
          shape: 'square',
        });
      }
    }

    if (dsl.externalDependencies.length) {
      const external: MindMapNode = {
        name: '《外部服务》',
        children: [],
      };
      root.children?.push(external);

      for (const service of dsl.externalDependencies) {
        external.children?.push({
          name: service.name,
          shape: 'square',
        });
      }
    }

    return root;
  }, [dsl, detail, domains]);

  if (tree == null) {
    return <Empty description="暂无数据" />;
  }

  return (
    <MermaidContainer>
      <MindMap tree={tree} {...other} />
    </MermaidContainer>
  );
});

export default Graph;
