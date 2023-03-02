import { observer } from 'mobx-react';
import { Menu } from '@antv/x6-react-components';
import classNames from 'classnames';
import { useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';

import { useCanvasModel } from './CanvasModelContext';
import s from './ContextMenu.module.scss';
import { EditorContextMenuItem, isDivider } from './ContextMenuController';
import { NoopArray } from '@wakeapp/utils';

// TODO: 溢出空间计算
export const ContextMenu = observer(function ContextMenu() {
  const { model } = useCanvasModel();

  const root = useMemo(() => {
    const el = document.createElement('div');
    el.className = 'vd-context-menu';
    return el;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, NoopArray);

  useEffect(() => {
    document.body.appendChild(root);

    return () => {
      root.remove();
    };
  }, [root]);

  const menu = model.contextMenuController.menu;
  const visible = model.contextMenuController.visible;

  if (menu == null) {
    return null;
  }

  const menus = menu.menus.filter(i => {
    return ('type' in i && i.type === 'divider') || (i as EditorContextMenuItem).visible !== false;
  });

  if (menus.length === 0) {
    return null;
  }

  return createPortal(
    <div
      className={s.root}
      style={{
        transform: `translate(${menu.position.x}px, ${menu.position.y}px)`,
        display: visible ? 'block' : 'none',
      }}
    >
      <Menu>
        {menus.map((item, index) => {
          if (isDivider(item)) {
            return <Menu.Divider key={index} />;
          }

          return (
            <Menu.Item
              key={item.key}
              className={classNames(s.item, { [s.danger]: item.danger })}
              disabled={item.disabled}
              onClick={item.handler}
            >
              {item.label}
            </Menu.Item>
          );
        })}
      </Menu>
    </div>,
    root
  );
});
