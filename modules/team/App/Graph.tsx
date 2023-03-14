import { Empty } from 'antd';
import { useMemo } from 'react';
import { observer } from 'mobx-react';
import { MermaidContainer, MindMap, MindMapNode } from '@/lib/components/Mermaid';
import { booleanPredicate } from '@wakeapp/utils';

import { AppDetail } from '../types';
import { useTeamLayoutModel } from '../TeamLayout';

export interface GraphProps extends React.HTMLAttributes<HTMLDivElement> {
  detail: AppDetail;
}

function stringifyName(node: { name: string; title?: string }) {
  return node.title ? `${node.title}<br>${node.name}` : node.name;
}

export const Graph = observer(function Graph(props: GraphProps) {
  const { detail, ...other } = props;
  const model = useTeamLayoutModel();

  const scenarios = useMemo(() => {
    return detail.version.businessSceneVersionDTOList
      ?.map(version => {
        const scenario = model?.scenarioList.find(i => i.id === version.businessSceneId);

        if (scenario == null) {
          return null;
        }

        return {
          scenario,
          version,
        };
      })
      .filter(booleanPredicate);
  }, [model?.scenarioList, detail.version.businessSceneVersionDTOList]);

  const domains = useMemo(() => {
    return detail.version.domainDesignVersionDTOList
      ?.map(version => {
        const domain = model?.domainList.find(i => i.id === version.domainDesignId);
        if (domain == null) {
          return null;
        }

        return {
          domain,
          version,
        };
      })
      .filter(booleanPredicate);
  }, [model?.domainList, detail.version.domainDesignVersionDTOList]);

  const tree = useMemo<MindMapNode | undefined>(() => {
    const root: MindMapNode = {
      name: `《应用》<br>${detail.name}`,
      shape: 'circle',
      children: [],
    };

    if (scenarios?.length) {
      const scenariosNode: MindMapNode = {
        name: '《业务场景》',
        children: [],
      };

      root.children?.push(scenariosNode);

      for (const { scenario, version } of scenarios) {
        scenariosNode.children?.push({
          name: stringifyName(scenario) + `<br>${version.currentVersion}`,
          shape: 'rounded-square',
        });
      }
    }

    if (domains?.length) {
      const domainsNode: MindMapNode = {
        name: '《业务域》',
        children: [],
      };

      root.children?.push(domainsNode);

      for (const { domain, version } of domains) {
        domainsNode.children?.push({
          name: stringifyName(domain) + `<br>${version.currentVersion}`,
          shape: 'square',
        });
      }
    }

    return root;
  }, [detail, scenarios, domains]);

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
