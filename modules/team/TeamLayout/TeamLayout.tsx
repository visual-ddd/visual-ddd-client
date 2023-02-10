import { observer } from 'mobx-react';
import { useRouter } from 'next/router';

import { Layout } from '../Layout';
import { LanguageIcon } from './LanguageIcon';
import { TeamIcon } from './TeamIcon';
import { DomainIcon } from './DomainIcon';
import { FlowIcon } from './FlowIcon';
import { AppIcon } from './AppIcon';
import { useEffect, useMemo } from 'react';
import { TeamLayoutModel } from './TeamLayoutModel';
import { TeamLayoutProvider } from './Context';
import { NoopArray } from '@wakeapp/utils';
import dynamic from 'next/dynamic';

export interface TeamLayoutProps {
  children: React.ReactNode;
}

const Creator = dynamic(() => import('../Creator'), { ssr: false });

export const TeamLayout = observer(function TeamLayout(props: TeamLayoutProps) {
  const { children } = props;
  const router = useRouter();
  const teamId = router.query.id as string | undefined;
  const model = useMemo(() => (teamId ? new TeamLayoutModel({ teamId }) : undefined), [teamId]);

  useEffect(() => {
    model?.initial();
  }, [model]);

  return (
    <TeamLayoutProvider value={model}>
      <Layout
        menu={[
          {
            icon: <TeamIcon />,
            name: '概览',
            route: `/team/${teamId}`,
            exact: true,
          },
          {
            icon: <LanguageIcon />,
            name: '统一语言',
            route: `/team/${teamId}/ubiquitous-language`,
            children: [
              {
                name: '组织',
                route: `/team/${teamId}/ubiquitous-language/organization`,
              },
              {
                name: '团队',
                route: `/team/${teamId}/ubiquitous-language`,
                exact: true,
              },
            ],
          },
          {
            icon: <DomainIcon />,
            name: '业务域',
            route: `/team/${teamId}/domain`,
            children: model?.domainListMenu,
          },
          { icon: <FlowIcon />, name: '业务场景', route: `/team/${teamId}/scenario` },
          { icon: <AppIcon />, name: '应用', route: `/team/${teamId}/app`, children: model?.appListMenu },
        ]}
        actions={NoopArray}
        primarySidebarSlot={<Creator />}
      >
        {children}
      </Layout>
    </TeamLayoutProvider>
  );
});

export const getTeamLayout = (children: React.ReactNode) => {
  return <TeamLayout>{children}</TeamLayout>;
};
