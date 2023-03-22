import classNames from 'classnames';
import { Header } from './Header';
import s from './Layout.module.scss';

export interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = (props: LayoutProps) => {
  const { children } = props;

  return (
    <div className={classNames(s.root)}>
      <Header />
      <div className={s.body}>{children}</div>
    </div>
  );
};

export const getDocumentLayout = (children: React.ReactNode) => {
  return <Layout>{children}</Layout>;
};
