import { MenuProps, Col } from 'antd';
import classNames from 'classnames';
import { Header } from './Header';
import { HeadingMenu } from './HeadingMenu';
import s from './Layout.module.scss';
import { Navigation } from './Navigation';

type MenuItem = Required<MenuProps>['items'][number];

export interface LayoutProps {
  children: React.ReactNode;
  menus?: MenuItem[];
  navigationTitle?: React.ReactNode;
}

export const Layout = (props: LayoutProps) => {
  const { menus, children, navigationTitle } = props;

  return (
    <div className={classNames(s.root)}>
      <Header fixed={!menus} />
      {menus ? (
        <div className={s.fullBody}>
          <Col lg={6} md={6} sm={24} xl={5} xs={24} xxl={4}>
            <Navigation menus={menus} title={navigationTitle} />
          </Col>
          <Col lg={18} md={18} sm={24} xl={19} xs={24} xxl={20} className={classNames(s.content)}>
            {children}
          </Col>
          <HeadingMenu />
        </div>
      ) : (
        <div className={s.body}>
          {children}
          <HeadingMenu />
        </div>
      )}
    </div>
  );
};

export const getDocumentLayout = (children: React.ReactNode) => {
  return <Layout>{children}</Layout>;
};
