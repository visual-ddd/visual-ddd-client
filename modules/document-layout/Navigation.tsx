import { Menu, MenuProps } from 'antd';
import classNames from 'classnames';
import s from './Navigation.module.scss';

type MenuItem = Required<MenuProps>['items'][number];

export interface NavigationProps {
  menus: MenuItem[];
  className?: string;
  title?: React.ReactNode;
}

export const Navigation = (props: NavigationProps) => {
  const { title, menus, className } = props;

  return (
    <aside className={classNames(s.root, className)}>
      {!!title && <div className={s.title}>{title}</div>}
      <Menu mode="inline" items={menus} className={s.menu}></Menu>
    </aside>
  );
};
