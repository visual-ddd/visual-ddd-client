import classNames from 'classnames';
import { Header } from './Header';
import { HeadingMenu } from './HeadingMenu';
import s from './Layout.module.scss';

export interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = (props: LayoutProps) => {
  const { children } = props;

  return (
    <div className={classNames(s.root)}>
      <Header />
      <div className={s.body}>
        {children}
        <HeadingMenu />
      </div>
    </div>
  );
};

export const getDocumentLayout = (children: React.ReactNode) => {
  return <Layout>{children}</Layout>;
};
