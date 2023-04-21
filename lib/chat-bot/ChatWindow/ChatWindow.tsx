import { observer } from 'mobx-react';
import { Drawer, Tooltip } from 'antd';
import { cloneElement, isValidElement, useEffect, useMemo, useState } from 'react';
import { CloseOutlined } from '@ant-design/icons';
import { useEventBusListener } from '@/lib/hooks';
import classNames from 'classnames';
import clamp from 'lodash/clamp';
import { tryDispose } from '@/lib/utils';

import { BotWindowModel } from '../BotWindowModel';
import { BotProvider } from '../BotContext';

import s from './ChatWindow.module.scss';
import { Prompt } from './Prompt';
import { History } from './History';
import { NewWindowIcon } from './NewWindowIcon';

export interface ChatWindowProps {
  children?: React.ReactNode;
  className?: string;
}

const MIN_WIDTH = 500;

export const ChatWindow = observer(function ChatWindow(props: ChatWindowProps) {
  const { children, className } = props;
  const [visible, setVisible] = useState(false);
  const windowModel = useMemo(() => new BotWindowModel(), []);

  const handleClose = () => {
    setVisible(false);
  };

  // TODO: 提取成 hooks
  const handleResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    const target = e.currentTarget as HTMLDivElement;
    let parent = target.closest('.ant-drawer-content-wrapper')! as HTMLDivElement;
    let startX = e.pageX;
    let disposed = false;
    let relativeWidth = windowModel.size;
    const MAX_WIDTH = window.innerWidth - 100;

    const handleMove = (evt: MouseEvent) => {
      const delta = evt.pageX - startX;
      const newWidth = clamp(relativeWidth - delta, MIN_WIDTH, MAX_WIDTH);

      parent.style.width = `${newWidth}px`;
    };

    const dispose = () => {
      if (disposed) {
        return;
      }

      disposed = true;

      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('mouseleave', handleEnd);
    };

    const handleEnd = (evt: MouseEvent) => {
      if (disposed) {
        return;
      }

      dispose();
      const newWidth = parent.offsetWidth;
      windowModel.setSize(newWidth);
    };

    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('mouseleave', handleEnd);
  };

  const handleOpenChat = () => {
    window.open('/chat', 'chat');
  };

  useEventBusListener(windowModel.event, on => {
    on('SHOW', () => {
      setVisible(v => !v);
    });
  });

  useEffect(() => {
    return () => {
      tryDispose(windowModel);
    };
  }, [windowModel]);

  const show = windowModel.show;

  return (
    <>
      <Drawer
        rootClassName={s.dialogRoot}
        open={visible}
        className={classNames(s.dialog, className)}
        title={null}
        mask={false}
        closable={false}
        onClose={handleClose}
        width={windowModel.size}
      >
        <div className={s.resizer} onMouseDown={handleResizeStart}></div>
        <div className={s.root}>
          <header className={s.head}>
            <div className={s.title}>
              Visual DDD AI ChatBot{' '}
              <span className={s.keybinding}>{windowModel.keybinding.getReadableKeyBinding('show').key}</span>
            </div>
            <Tooltip title="新页面打开聊天窗" placement="bottom" mouseEnterDelay={0.5}>
              <NewWindowIcon className={s.newWindow} onClick={handleOpenChat} />
            </Tooltip>
            <Tooltip placement="bottom" title="关闭 (Esc)" mouseEnterDelay={0.5}>
              <CloseOutlined className={s.close} onClick={handleClose} title="关闭" />
            </Tooltip>
          </header>
          {windowModel.store.currentActiveSession?.model && (
            <BotProvider bot={windowModel.store.currentActiveSession.model}>
              <div className={s.history}>
                <History />
              </div>
              <div className={s.prompt}>
                <Prompt />
              </div>
            </BotProvider>
          )}
        </div>
      </Drawer>

      {isValidElement(children) &&
        cloneElement(children, {
          // @ts-expect-error
          onClick: show,
        })}
    </>
  );
});
