import { observer } from 'mobx-react';

import { Layout } from '../../team/Layout';

import { NoopArray } from '@wakeapp/utils';
import { ControlOutlined } from '@ant-design/icons';

export interface SystemLayoutProps {
  children: React.ReactNode;
}

/**
 * 系统管理布局
 */
export const SystemLayout = observer(function SystemLayout(props: SystemLayoutProps) {
  const { children } = props;

  return (
    <Layout
      menu={[
        {
          icon: <ControlOutlined />,
          name: '系统管理',
          route: `/system`,
          children: [
            {
              name: '组织管理',
              route: '/system/organization',
            },
            {
              name: '用户管理',
              route: '/system/user',
            },
          ],
        },
      ]}
      actions={NoopArray}
    >
      {children}
    </Layout>
  );
});

export const getSystemLayout = (children: React.ReactNode) => {
  return <SystemLayout>{children}</SystemLayout>;
};
