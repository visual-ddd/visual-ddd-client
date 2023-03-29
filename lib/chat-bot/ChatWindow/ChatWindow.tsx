import { observer } from 'mobx-react';
import clamp from 'lodash/clamp';
import { BotProvider } from './Context';

import s from './ChatWindow.module.scss';
import { Prompt } from './Prompt';
import { cloneElement, isValidElement, useMemo, useState } from 'react';
import { Drawer } from 'antd';
import { History } from './History';
import { CloseOutlined } from '@ant-design/icons';
import { BotModel } from '../BotModel';
import { useEventBusListener } from '@/lib/hooks';

export interface ChatWindowProps {
  children?: React.ReactNode;
}

const MIN_WIDTH = 500;

export const ChatWindow = observer(function ChatWindow(props: ChatWindowProps) {
  const { children } = props;
  const [visible, setVisible] = useState(false);
  const bot = useMemo(() => new BotModel(), []);

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
    let relativeWidth = bot.size;
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
      bot.setSize(newWidth);
    };

    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('mouseleave', handleEnd);
  };

  useEventBusListener(bot.event, on => {
    on('SHOW', () => {
      setVisible(true);
    });
  });

  return (
    <BotProvider bot={bot}>
      <Drawer
        rootClassName={s.dialogRoot}
        open={visible}
        className={s.dialog}
        title={null}
        mask={false}
        closable={false}
        onClose={handleClose}
        width={bot.size}
      >
        <div className={s.resizer} onMouseDown={handleResizeStart}></div>
        <div className={s.root}>
          <header className={s.head}>
            <div className={s.title}>
              Visual DDD AI ChatBot{' '}
              <span className={s.keybinding}>{bot.keybinding.getReadableKeyBinding('show').key}</span>
            </div>
            <CloseOutlined className={s.close} onClick={handleClose} />
          </header>
          <div className={s.history}>
            <History />
          </div>
          <div className={s.prompt}>
            <Prompt />
          </div>
        </div>
      </Drawer>

      {isValidElement(children) &&
        cloneElement(children, {
          // @ts-expect-error
          onClick: bot.show,
        })}
    </BotProvider>
  );
});
