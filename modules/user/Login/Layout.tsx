import { LogoIcon } from '@/modules/Layout/LogoIcon';
import classNames from 'classnames';

import s from './Layout.module.scss';

export interface LayoutProps {
  title?: React.ReactNode;
  children: React.ReactNode;

  className?: string;
  style?: React.CSSProperties;
}

export const Layout = function Layout(props: LayoutProps) {
  const { title, children, className, ...other } = props;

  return (
    <div className={classNames('vd-entry', className, s.root)} {...other}>
      <div className={classNames('vd-entry__body', s.body)}>
        <header className={classNames('vd-entry__head', s.head)}>
          <span className={classNames('vd-entry__logo', s.logo)}>
            <LogoIcon />
          </span>
          <span className={classNames('vd-entry__title', s.title)}>{title}</span>
        </header>
        <main className={classNames('vd-entry__content', s.content)}>{children}</main>
      </div>
    </div>
  );
};

Layout.H1 = function H1(props: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h1 {...props} className={classNames('vd-entry__h1', s.h1, props.className)} />;
};
