import { observer } from 'mobx-react';
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

export const ChatWindow = observer(function ChatWindow(props: ChatWindowProps) {
  const { children } = props;
  const [visible, setVisible] = useState(false);
  const bot = useMemo(() => new BotModel(), []);

  const handleClose = () => {
    setVisible(false);
  };

  useEventBusListener(bot.event, on => {
    on('SHOW', () => {
      setVisible(true);
    });
  });

  return (
    <BotProvider bot={bot}>
      <Drawer
        open={visible}
        className={s.dialog}
        title={null}
        mask={false}
        closable={false}
        onClose={handleClose}
        width={500}
      >
        <div className={s.root}>
          <header className={s.head}>
            <div className={s.title}>Visual DDD AI ChatBot</div>
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
