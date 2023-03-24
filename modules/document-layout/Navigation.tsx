import { Menu, MenuProps } from 'antd';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import s from './Navigation.module.scss';

type MenuItem = Required<MenuProps>['items'][number];

export interface NavigationProps {
  menus: MenuItem[];
  className?: string;
  title?: React.ReactNode;
}

export const Navigation = (props: NavigationProps) => {
  const { title, menus, className } = props;
  const router = useRouter();

  return (
    <aside className={classNames(s.root, className)}>
      {!!title && <div className={s.title}>{title}</div>}
      <Menu mode="inline" items={menus} className={s.menu} selectedKeys={[router.asPath]}></Menu>
    </aside>
  );
};
