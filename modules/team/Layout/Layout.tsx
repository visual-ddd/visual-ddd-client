import classNames from 'classnames';
import { useMemo, useState } from 'react';
import { observer } from 'mobx-react';

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

  /**
   * 主体内容
   */
  children: React.ReactNode;
}

export const Layout = observer(function Layout(props: LayoutProps) {
  const { menu, actions, children } = props;
  const [title, setTitle] = useState<React.ReactNode>();

  const context = useMemo<LayoutContextValue>(() => {
    return {
      setTitle(t) {
        setTitle(t);
      },
    };
  }, []);

  return (
    <LayoutContextProvider value={context}>
      <div className={classNames('vd-layout', s.root)}>
        <Header className={s.header} title={title}></Header>
        <div className={classNames('vd-layout-body', s.body)}>
          <Sidebar menu={menu} actions={actions} className={classNames(s.sidebar)} />
          <Content className={s.content}>{children}</Content>
        </div>
      </div>
    </LayoutContextProvider>
  );
});
