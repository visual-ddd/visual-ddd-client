import { observer } from 'mobx-react';
import { useRouter } from 'next/router';
import { ProCard } from '@ant-design/pro-components';

import { Layout } from '../Layout';
import { LanguageIcon } from './LanguageIcon';
import { TeamIcon } from './TeamIcon';
import { DomainIcon } from './DomainIcon';
import { FlowIcon } from './FlowIcon';
import { AppIcon } from './AppIcon';

export const TeamLayout = observer(() => {
  const router = useRouter();
  const teamId = router.query.id as string;

  return (
    <Layout
      menu={[
        {
          icon: <TeamIcon />,
          name: '概览',
          route: `/team/${teamId}`,
          exact: true,
          children: [
            {
              name: '团队统一语言',
              route: `/team/${teamId}`,
            },
            {
              name: '超长的文本笨笨打卡机阿德可洁可净ad啊打卡机阿德啊大大ad',
              route: `/team/${teamId}/first`,
            },
          ],
        },
        { icon: <LanguageIcon />, name: '统一语言', route: `/team/${teamId}/ubiquitous-language` },
        { icon: <DomainIcon />, name: '业务域', route: `/team/${teamId}/domain` },
        { icon: <FlowIcon />, name: '业务场景', route: `/team/${teamId}/scenario` },
        { icon: <AppIcon />, name: '应用', route: `/team/${teamId}/app` },
      ]}
      actions={[]}
    >
      <ProCard>body</ProCard>
    </Layout>
  );
});
