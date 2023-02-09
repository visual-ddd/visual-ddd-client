import classNames from 'classnames';
import { observer } from 'mobx-react';

import { LogoIcon } from './LogoIcon';
import s from './Header.module.scss';

export interface HeaderProps {
  className?: string;
  style?: React.CSSProperties;
  title?: React.ReactNode;
}

export const Header = observer(function Header(props: HeaderProps) {
  const { className, title, ...other } = props;
  return (
    <div className={classNames('vd-layout-header', className, s.root)} {...other}>
      <div className={classNames('vd-layout-header__logo', s.logo)}>
        <LogoIcon />
      </div>
      <div className={classNames('vd-layout-header__content')}>
        {!!title && <div className={classNames('vd-layout-header__title')}>{title}</div>}
      </div>
    </div>
  );
});
