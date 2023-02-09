import { Tooltip } from 'antd';
import classNames from 'classnames';
import { observer } from 'mobx-react';
import { useRouter } from 'next/router';
import { useMemo } from 'react';

import type { LayoutAction, LayoutMenu } from './types';
import { User } from './User';
import s from './Sidebar.module.scss';

export interface SidebarProps {
  /**
   * 菜单
   */
  menu: LayoutMenu[];

  /**
   * 用户操作
   */
  actions: LayoutAction[];

  className?: string;
  style?: React.CSSProperties;
}

export const Sidebar = observer(function Sidebar(props: SidebarProps) {
  const { menu, actions, className, ...other } = props;
  const router = useRouter();
  const pathname = router.asPath;

  const activeMenuItem = useMemo(() => {
    let matched: LayoutMenu | undefined;

    for (const item of menu) {
      // 先精确匹配
      if (item.exact) {
        if (pathname === item.route) {
          matched = item;
          break;
        }
      } else if (pathname.startsWith(item.route)) {
        matched = item;
      }
    }

    return matched;
  }, [pathname, menu]);

  return (
    <div className={classNames('vd-layout-sidebar', className, s.root)} {...other}>
      <div className={classNames('vd-layout-sidebar__primary', s.primary)}>
        {menu.map(i => {
          const active = activeMenuItem === i;

          return (
            <Tooltip key={i.route} title={i.name} placement="right">
              <div className={classNames('vd-layout-sidebar__primary-item', s.primaryItem, { active })}>{i.icon}</div>
            </Tooltip>
          );
        })}
        <div className={classNames('vd-layout-sidebar__user', s.user)}>
          <User actions={actions} />
        </div>
      </div>
      {!!activeMenuItem?.children?.length && (
        <div className={classNames('vd-layout-sidebar__secondary', s.secondary)}>
          {activeMenuItem.children.map(i => {
            const active = pathname.startsWith(i.route);
            return (
              <div
                className={classNames('vd-layout-sidebar__secondary-item', s.secondaryItem, { active })}
                key={i.route}
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
