import { Tooltip } from 'antd';
import classNames from 'classnames';
import { observer } from 'mobx-react';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import { NoopArray } from '@wakeapp/utils';

import type { LayoutAction, LayoutMenu, LayoutMenuItem } from './types';
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
  const [subMenu, setSubMenu] = useState<LayoutMenuItem[]>(NoopArray);
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

  useEffect(() => {
    if (activeMenuItem) {
      if (Array.isArray(activeMenuItem.children)) {
        setSubMenu(activeMenuItem.children);
      } else if (typeof activeMenuItem.children === 'function') {
        setSubMenu(NoopArray);
        let cancelled = false;

        activeMenuItem
          .children()
          .then(children => {
            if (!cancelled) {
              setSubMenu(children);
            }
          })
          .catch(err => {
            console.error(`加载菜单失败`, err);
          });

        return () => {
          cancelled = true;
        };
      } else {
        setSubMenu(NoopArray);
      }
    } else {
      setSubMenu(NoopArray);
    }
  }, [activeMenuItem]);

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
        <div className={classNames('vd-layout-sidebar__user', s.user)}>
          <User actions={actions} />
        </div>
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
