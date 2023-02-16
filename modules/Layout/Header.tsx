import classNames from 'classnames';
import { observer } from 'mobx-react';
import dynamic from 'next/dynamic';

import type { LayoutAction } from './types';
import { LogoIcon } from './LogoIcon';
import s from './Header.module.scss';

const User = dynamic(() => import('./User'), { ssr: false });

export interface HeaderProps {
  className?: string;
  style?: React.CSSProperties;
  title?: React.ReactNode;
  /**
   * 用户操作
   */
  actions: LayoutAction[];
}

export const Header = observer(function Header(props: HeaderProps) {
  const { className, title, actions, ...other } = props;

  return (
    <div className={classNames('vd-layout-header', className, s.root)} {...other}>
      <div className={classNames('vd-layout-header__logo', s.logo)}>
        <LogoIcon />
      </div>
      <div className={classNames('vd-layout-header__content', s.content)}>
        {!!title && <div className={classNames('vd-layout-header__title', s.title)}>{title}</div>}
      </div>
      <div className={classNames('vd-layout-header__extra', s.extra)}>
        <User actions={actions} />
      </div>
    </div>
  );
});
