import { observer } from 'mobx-react';
import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import { NoopArray } from '@wakeapp/utils';
import dynamic from 'next/dynamic';
import { useSession } from '@/modules/session';
import { Layout, LayoutAction } from '@/modules/Layout';

import { LanguageIcon } from './LanguageIcon';
import { TeamIcon } from './TeamIcon';
import { DomainIcon } from './DomainIcon';
import { FlowIcon } from './FlowIcon';
import { AppIcon } from './AppIcon';
import { TeamLayoutModel } from './TeamLayoutModel';
import { TeamLayoutProvider } from './Context';
import { Updater, useUpdater } from '../Updater';

export interface TeamLayoutProps {
  children: React.ReactNode;
}

const Creator = dynamic(() => import('../Creator'), { ssr: false });

export const TeamLayout = observer(function TeamLayout(props: TeamLayoutProps) {
  const { children } = props;
  const router = useRouter();
  const teamId = router.query.id as string | undefined;
  const session = useSession({ immutable: false });
  const updaterRef = useUpdater();
  const model = useMemo(() => (teamId ? new TeamLayoutModel({ teamId }) : undefined), [teamId]);

  /**
   * 是否为团队管理员
   */
  const isTeamManager = session.session?.state?.isManager;
  const actions = useMemo<LayoutAction[]>(() => {
    if (isTeamManager) {
      return [{ name: '团队管理', handler: () => updaterRef.current?.open() }];
    }

    return NoopArray;
  }, [isTeamManager, updaterRef]);

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
        actions={actions}
        primarySidebarSlot={<Creator />}
      >
        {children}
        {!!isTeamManager && <Updater ref={updaterRef} />}
      </Layout>
    </TeamLayoutProvider>
  );
});

export const getTeamLayout = (children: React.ReactNode) => {
  return <TeamLayout>{children}</TeamLayout>;
};
