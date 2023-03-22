import classNames from 'classnames';
import s from './Header.module.scss';

export interface HeaderProps {}

export const Header = (props: HeaderProps) => {
  return (
    <header className={classNames(s.root)}>
      <div className={s.body}>
        <div className={s.logo}>
          <img src="/logo.svg" alt="logo" />
          <span>Visual DDD</span>
        </div>
      </div>
    </header>
  );
};
