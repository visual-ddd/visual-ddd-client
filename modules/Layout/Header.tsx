import classNames from 'classnames';
import { observer } from 'mobx-react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';

import type { LayoutAction, LayoutMenu, LayoutMenuItem } from './types';
import { LogoIcon } from './LogoIcon';
import s from './Header.module.scss';

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
  const router = useRouter();

  return (
    <div className={classNames('vd-layout-header', className, s.root)} {...other}>
      <div className={classNames('vd-layout-header__logo', s.logo)}>
        <LogoIcon />
      </div>
      <div className={classNames('vd-layout-header__content', s.content)}>
        {!!(activeMenuItem && subMenu.length) && (
          <>
            <div
              className={classNames('vd-layout-header__home', s.home)}
              onClick={() => {
                router.push(activeMenuItem.route);
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
