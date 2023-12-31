import classNames from 'classnames';
import { observer } from 'mobx-react';
import dynamic from 'next/dynamic';

import type { LayoutAction, LayoutMenu, LayoutMenuItem } from './types';
import { LogoIcon } from './LogoIcon';
import s from './Header.module.scss';
import { openMenu } from './utils';
import Link from 'next/link';

const User = dynamic(() => import('./User'), { ssr: false });

export interface HeaderProps {
  className?: string;
  style?: React.CSSProperties;
  title?: React.ReactNode;

  /**
   * 当前激活的一级标题
   */
  activeMenuItem?: LayoutMenu;

  /**
   * 二级标题
   */
  subMenu: LayoutMenuItem[];

  /**
   * 用户操作
   */
  actions: LayoutAction[];
}

export const Header = observer(function Header(props: HeaderProps) {
  const { className, title, subMenu, activeMenuItem, actions, ...other } = props;

  return (
    <div className={classNames('vd-layout-header', className, s.root)} {...other}>
      <Link className={classNames('vd-layout-header__logo', s.logo)} href="/">
        <LogoIcon />
      </Link>
      <div className={classNames('vd-layout-header__content', s.content)}>
        {!!(activeMenuItem && subMenu.length) && (
          <>
            <div
              className={classNames('vd-layout-header__home', s.home)}
              onClick={() => {
                openMenu(activeMenuItem);
              }}
            >
              {activeMenuItem.name}
            </div>
            <span className={classNames('vd-layout-header__split', s.split)}>/</span>
          </>
        )}
        {!!title && <div className={classNames('vd-layout-header__title', s.title)}>{title}</div>}
      </div>
      <div className={classNames('vd-layout-header__extra', s.extra)}>
        <User actions={actions} />
      </div>
    </div>
  );
});
