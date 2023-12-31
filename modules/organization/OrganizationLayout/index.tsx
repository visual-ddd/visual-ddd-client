import { observer } from 'mobx-react';

import { Layout } from '../../Layout';

import { NoopArray } from '@wakeapp/utils';
import { ControlOutlined } from '@ant-design/icons';
import { useRouter } from 'next/router';
import { useSession } from '@/modules/session';

export interface OrganizationLayoutProps {
  children: React.ReactNode;
}

/**
 * 组织布局
 */
export const OrganizationLayout = observer(function OrganizationLayout(props: OrganizationLayoutProps) {
  const { children } = props;
  const router = useRouter();
  const id = router.query.id as string;
  const { session } = useSession();

  return (
    <Layout
      menu={[
        {
          icon: <ControlOutlined />,
          name: session?.state ? `${session.state.entryName} - 组织管理` : '组织管理',
          route: `/organization/${id}`,
        },
      ]}
      actions={NoopArray}
    >
      {children}
    </Layout>
  );
});

export const getOrganizationLayout = (children: React.ReactNode) => {
  return <OrganizationLayout>{children}</OrganizationLayout>;
};
