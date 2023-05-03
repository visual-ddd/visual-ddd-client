import { observer } from 'mobx-react';
import { EditOutlined, MinusCircleFilled, PlusOutlined } from '@ant-design/icons';
import classNames from 'classnames';
import { useRef, useState } from 'react';
import { Popconfirm, message } from 'antd';

import { useBotSessionStoreContext } from '../BotSessionStoreContext';
import type { BotSession } from '../BotSession';
import type { Prompt } from '../types';
import { PromptLibraryModal } from '../PromptLibrary';
import { DEFAULT_TITLE } from '../constants';

import s from './Sidebar.module.scss';
import { ExploreIcon } from './ExploreIcon';

export interface SidebarProps {
  footer?: React.ReactNode;
}

const Item = observer(function Item(props: { item: BotSession; active: boolean }) {
  const { item, active } = props;
  const store = useBotSessionStoreContext();
  const [editing, setEditing] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  const handleRemove = (evt?: React.MouseEvent) => {
    evt?.preventDefault();
    evt?.stopPropagation();

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
      target.innerText = item.name || DEFAULT_TITLE;
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
        dangerouslySetInnerHTML={{ __html: item.name || DEFAULT_TITLE }}
        onClick={handleClick}
      ></span>
      {!!item.removable && <EditOutlined className={s.removeSession} onClick={handleDoubleClick} />}
      {!!item.removable && (
        <Popconfirm title="确认删除？" onConfirm={handleRemove} placement="right">
          <MinusCircleFilled className={s.removeSession} />
        </Popconfirm>
      )}
    </div>
  );
});

export const Sidebar = observer(function Sidebar(props: SidebarProps) {
  const { footer } = props;
  const store = useBotSessionStoreContext();

  const handleAddSession = () => {
    store.addSession();
    message.success('会话已创建');
  };

  const handleAddSessionFromLibrary = (prompt: Prompt) => {
    store.addSessionFromPrompt(prompt);
    message.success('已导入');
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
        <PromptLibraryModal onImport={handleAddSessionFromLibrary}>
          <div className={classNames(s.session, 'u-secondary', s.discovery)}>
            <ExploreIcon />
            <div className={s.sessionName}>探索</div>
          </div>
        </PromptLibraryModal>
        {footer}
      </div>
    </div>
  );
});
