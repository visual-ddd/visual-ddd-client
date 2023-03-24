import { Layout } from '@/modules/document-layout';
import { MenuProps } from 'antd';
import { useRouter } from 'next/router';
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

export interface AppDocLayoutProps {
  info: AppInfo;
  children?: React.ReactNode;
}

type MenuItem = Required<MenuProps>['items'][number];

export const AppDocLayout = (props: AppDocLayoutProps) => {
  const { info, children } = props;
  const router = useRouter();

  const items = useMemo(() => {
    const home = `/doc/app/${info.applicationDTO.id}/reversion/${info.id}`;
    const items: MenuItem[] = [
      {
        key: home,
        label: '应用',
        onClick: () => router.push(home),
      },
    ];

    if (info.domainDesignVersionInfos.length) {
      const item: MenuItem = {
        key: 'domain',
        type: 'group',
        label: '业务域',
        children: info.domainDesignVersionInfos.map(i => {
          const key = `/doc/app/${info.applicationDTO.id}/reversion/${info.id}/domain/${i.domainDesignDTO.id}/reversion/${i.id}`;
          return {
            key: key,
            label: i.domainDesignDTO.name,
            onClick: () => {
              router.push(key);
            },
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
          const key = `/doc/app/${info.applicationDTO.id}/reversion/${info.id}/scenario/${i.businessScenarioDTO.id}/reversion/${i.id}`;
          return {
            key: key,
            label: i.businessScenarioDTO.name,
            onClick: () => {
              router.push(key);
            },
          };
        }),
      };

      items.push(item);
    }

    return items;
  }, [info, router]);

  return (
    <Layout menus={items} navigationTitle={info.applicationDTO.name}>
      {children}
    </Layout>
  );
};
