import React, { ReactElement, useState } from 'react';
import { Avatar, Dropdown, MenuProps } from 'antd';
import { Layout } from 'antd';
import { useRouter } from 'next/router';
import { CaretDownOutlined, LeftOutlined, RightOutlined, UserOutlined } from '@ant-design/icons';
import { Logo } from '../user';
import s from './index.module.scss';
import { PageMenu } from './components';

const { Content, Sider } = Layout;

export interface LayoutProps {
  children?: React.ReactNode;
  pageTitle?: string;
}

const LayoutPage = ({ children, pageTitle }: LayoutProps) => {
  const [collapsed, setCollapsed] = useState(false);

  const router = useRouter();

  /**
   * 账户设置
   */
  const handleAccountSet = () => {
    console.log('账户设置');
  };

  /**
   * 前往启动页
   */
  const handleLaunch = () => {
    router.push('/launch');
  };

  /**
   * 退出登录
   */
  const handleLogout = () => {
    router.push('/login');
  };

  /**
   * 帮助
   */
  const handleHelp = () => {
    console.log('帮助');
  };

  /**
   * 用户下拉菜单
   */
  const userMenuItems: MenuProps['items'] = [
    {
      key: '1',
      label: <div onClick={handleAccountSet}>账户设置</div>,
    },
    {
      key: '2',
      label: <div onClick={handleLaunch}>前往启动页</div>,
    },
    {
      key: '3',
      label: <div onClick={handleLogout}>退出登录</div>,
    },
    {
      key: '4',
      label: <div onClick={handleHelp}>帮助</div>,
    },
  ];

  return (
    <Layout className={s.layout}>
      <Sider theme="light" collapsible collapsed={collapsed} onCollapse={value => setCollapsed(value)} trigger={null}>
        <div className={s.logo}>
          <Logo horizontal size="default" hideTitle={collapsed} />
        </div>
        <PageMenu className={s.menu} />
        <div className={s.collapsed} onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? <RightOutlined /> : <LeftOutlined />}
        </div>

        <Dropdown menu={{ items: userMenuItems }} className={s.user} placement="top" arrow={{ pointAtCenter: true }}>
          <div>
            <Avatar icon={<UserOutlined />} />
            {!collapsed && (
              <>
                <span className={s.userName}>用户</span>
                <CaretDownOutlined />
              </>
            )}
          </div>
        </Dropdown>
      </Sider>
      <Layout className={s.siteLayout}>
        <Content className={s.content}>
          <main className={s.main}>
            {pageTitle && <div className={s.pageTitle}>{pageTitle}</div>}
            {children}
          </main>
        </Content>
      </Layout>
    </Layout>
  );
};

export default LayoutPage;

export function getLayout(page: ReactElement, pageTitle?: string) {
  return <LayoutPage pageTitle={pageTitle}>{page}</LayoutPage>;
}
