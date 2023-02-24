import { Tooltip } from 'antd';
import classNames from 'classnames';
import { observer } from 'mobx-react';
import { useRouter } from 'next/router';

import type { LayoutMenu, LayoutMenuItem } from './types';
import s from './Sidebar.module.scss';

export interface SidebarProps {
  /**
   * 菜单
   */
  menu: LayoutMenu[];

  /**
   * 当前激活的一级标题
   */
  activeMenuItem?: LayoutMenu;

  /**
   * 二级标题
   */
  subMenu: LayoutMenuItem[];

  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export const Sidebar = observer(function Sidebar(props: SidebarProps) {
  const { menu, className, children, activeMenuItem, subMenu, ...other } = props;
  const router = useRouter();
  const pathname = router.asPath;

  return (
    <div className={classNames('vd-layout-sidebar', className, s.root)} {...other}>
      <div className={classNames('vd-layout-sidebar__primary', s.primary)}>
        {menu.map(i => {
          const active = activeMenuItem === i;

          return (
            <Tooltip key={i.route} title={i.name} placement="right">
              <div
                className={classNames('vd-layout-sidebar__primary-item', s.primaryItem, { active })}
                onClick={() => {
                  router.push(i.route);
                }}
              >
                {i.icon}
              </div>
            </Tooltip>
          );
        })}
        {children}
      </div>
      {!!subMenu.length && (
        <div className={classNames('vd-layout-sidebar__secondary', s.secondary)}>
          {subMenu.map(i => {
            const active = i.exact ? pathname === i.route : pathname.startsWith(i.route);
            return (
              <div
                className={classNames('vd-layout-sidebar__secondary-item', s.secondaryItem, { active })}
                key={i.route}
                onClick={() => {
                  router.push(i.route);
                }}
              >
                {i.name}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
});
