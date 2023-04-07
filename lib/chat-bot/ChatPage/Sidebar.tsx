import { observer } from 'mobx-react';
import { EditOutlined, MinusCircleFilled, PlusOutlined } from '@ant-design/icons';
import classNames from 'classnames';
import { useRef, useState } from 'react';
import { message } from 'antd';
import Link from 'next/link';

import { useBotSessionStoreContext } from '../BotSessionStoreContext';
import type { BotSession } from '../BotSession';

import s from './Sidebar.module.scss';

export interface SidebarProps {}

const Item = observer(function Item(props: { item: BotSession; active: boolean }) {
  const { item, active } = props;
  const store = useBotSessionStoreContext();
  const [editing, setEditing] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  const handleRemove = (evt: React.MouseEvent) => {
    evt.preventDefault();
    evt.stopPropagation();

    store.removeSession(item.uuid);
  };

  const handleActive = () => {
    store.activeSession(item.uuid);
  };

  const handleDoubleClick = (evt: React.MouseEvent) => {
    evt.preventDefault();
    evt.stopPropagation();
    if (!item.removable) {
      message.warning(`默认会话不允许编辑名称`);

      return;
    }

    setEditing(true);

    const target = elementRef.current as HTMLDivElement;

    requestAnimationFrame(() => {
      target.focus();

      const selection = window.getSelection();
      selection?.removeAllRanges();

      const range = document.createRange();
      range.selectNodeContents(target);

      selection?.addRange(range);
    });
  };

  const handleBlur = (evt: React.FocusEvent | React.KeyboardEvent) => {
    const target = evt.currentTarget as HTMLDivElement;
    const value = target.textContent;
    if (value?.trim()) {
      // 最多限制 50 个字符
      item.setName(value.slice(0, 50));
    } else {
      target.innerText = item.name;
    }

    setEditing(false);
  };

  const handleClick = (evt: React.MouseEvent) => {
    if (editing) {
      evt.stopPropagation();
    }
  };

  const handleKeyDown = (evt: React.KeyboardEvent) => {
    const prevent = () => {
      evt.preventDefault();
      evt.stopPropagation();
    };
    if (evt.key === 'Enter') {
      prevent();
      handleBlur(evt);
    }
  };

  return (
    <div className={classNames(s.session, { active })} onClick={handleActive}>
      <span
        ref={elementRef}
        className={s.sessionName}
        contentEditable={editing}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        dangerouslySetInnerHTML={{ __html: item.name }}
        onClick={handleClick}
      ></span>
      {!!item.removable && <EditOutlined className={s.removeSession} onClick={handleDoubleClick} />}
      {!!item.removable && <MinusCircleFilled className={s.removeSession} onClick={handleRemove} />}
    </div>
  );
});

export const Sidebar = observer(function Sidebar(props: SidebarProps) {
  const store = useBotSessionStoreContext();

  const handleAddSession = () => {
    store.addSession();
  };

  return (
    <div className={s.root}>
      <div className={s.sessions}>
        <div className={s.session} onClick={handleAddSession} id="chat-page-add-session">
          <PlusOutlined className={s.addSession} />
          <div className={s.sessionName}>新增会话</div>
        </div>
        {store.sessions.map(i => {
          return <Item item={i} key={i.uuid} active={i.uuid === store.active} />;
        })}
      </div>
      <div className={s.footer}>
        <Link href="/" className={s.logo}>
          <img src="/logo.svg" alt="logo" />
        </Link>
      </div>
    </div>
  );
});
