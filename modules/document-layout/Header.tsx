import classNames from 'classnames';
import s from './Header.module.scss';

export interface HeaderProps {
  /**
   * 悬浮模式
   */
  fixed?: boolean;
}

export const Header = (props: HeaderProps) => {
  const { fixed } = props;
  return (
    <header className={classNames(s.root, { fixed })}>
      <div className={s.body}>
        <div className={s.logo}>
          <img src="/logo.svg" alt="logo" />
          <span>Visual DDD</span>
        </div>
      </div>
    </header>
  );
};
