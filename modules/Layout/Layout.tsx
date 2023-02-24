import classNames from 'classnames';
import { useMemo, useState } from 'react';
import { observer } from 'mobx-react';
import { useRouter } from 'next/router';
import { NoopArray } from '@wakeapp/utils';

import { LayoutAction, LayoutMenu } from './types';
import { Sidebar } from './Sidebar';
import { LayoutContextProvider, LayoutContextValue } from './Context';
import { Header } from './Header';

import s from './Layout.module.scss';
import { Content } from './Content';

export interface LayoutProps {
  /**
   * 菜单
   */
  menu: LayoutMenu[];

  /**
   * 用户操作
   */
  actions: LayoutAction[];

  primarySidebarSlot?: React.ReactNode;

  /**
   * 主体内容
   */
  children: React.ReactNode;
}

export const Layout = observer(function Layout(props: LayoutProps) {
  const { menu, actions, children, primarySidebarSlot } = props;
  const [title, setTitle] = useState<React.ReactNode>();
  const router = useRouter();
  const pathname = router.asPath;

  /**
   * 当前激活的一级标题
   */
  const activeMenuItem = useMemo(() => {
    let matched: LayoutMenu | undefined;

    for (const item of menu) {
      // 先精确匹配
      if (item.exact) {
        if (pathname === item.route) {
          matched = item;
          break;
        }
      } else if (pathname.startsWith(item.route)) {
        matched = item;
      }
    }

    return matched;
  }, [pathname, menu]);

  const context = useMemo<LayoutContextValue>(() => {
    return {
      setTitle(t) {
        setTitle(t);
        document.title = `${t} - Visual DDD`;
      },
    };
  }, []);

  const subMenu = activeMenuItem?.children ?? NoopArray;

  return (
    <LayoutContextProvider value={context}>
      <div className={classNames('vd-layout', s.root)}>
        <Header
          className={s.header}
          activeMenuItem={activeMenuItem}
          subMenu={subMenu}
          title={title}
          actions={actions}
        ></Header>
        <div className={classNames('vd-layout-body', s.body)}>
          <Sidebar menu={menu} subMenu={subMenu} activeMenuItem={activeMenuItem} className={classNames(s.sidebar)}>
            {primarySidebarSlot}
          </Sidebar>
          <Content className={s.content}>{children}</Content>
        </div>
      </div>
    </LayoutContextProvider>
  );
});
