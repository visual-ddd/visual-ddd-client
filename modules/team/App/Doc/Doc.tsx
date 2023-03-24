import { Layout } from '@/modules/document-layout';
import { MenuProps } from 'antd';
import { useMemo } from 'react';
import { AppSimple, AppVersion, DomainSimple, DomainVersion, ScenarioSimple, ScenarioVersion } from '../../types';

// import s from './Doc.module.scss';

export interface DomainInfo extends DomainVersion {
  domainDesignDTO: DomainSimple;
}

export interface ScenarioInfo extends ScenarioVersion {
  businessScenarioDTO: ScenarioSimple;
}

export interface AppInfo extends AppVersion {
  /**
   * 应用信息
   */
  applicationDTO: AppSimple;

  /**
   * 业务域
   */
  domainDesignVersionInfos: DomainInfo[];

  /**
   * 业务场景
   */
  businessScenarioVersionInfos: ScenarioInfo[];
}

export interface DocProps {
  info: AppInfo;
  children?: React.ReactNode;
}

type MenuItem = Required<MenuProps>['items'][number];

export const Doc = (props: DocProps) => {
  const { info, children } = props;

  const items = useMemo(() => {
    const items: MenuItem[] = [];

    if (info.domainDesignVersionInfos.length) {
      const item: MenuItem = {
        key: 'domain',
        type: 'group',
        label: '业务域',
        children: info.domainDesignVersionInfos.map(i => {
          return {
            key: `domain-${i.id}`,
            label: i.domainDesignDTO.name,
          };
        }),
      };

      items.push(item);
    }

    if (info.businessScenarioVersionInfos.length) {
      const item: MenuItem = {
        key: 'scenario',
        label: '业务场景',
        type: 'group',
        children: info.businessScenarioVersionInfos.map(i => {
          return {
            key: `scenario-${i.id}`,
            label: i.businessScenarioDTO.name,
          };
        }),
      };

      items.push(item);
    }

    return items;
  }, [info]);

  return (
    <Layout menus={items} navigationTitle={info.applicationDTO.name}>
      {children}
    </Layout>
  );
};
