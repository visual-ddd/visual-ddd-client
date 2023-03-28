import { useEventBusListener } from '@/lib/hooks';
import { Loading, LoadingIcon } from '@/lib/openai-event-source';
import { MinusCircleFilled } from '@ant-design/icons';
import classNames from 'classnames';
import { observer } from 'mobx-react';
import { useRef } from 'react';
import { Message, Role, ExtensionType, GLOBAL_EXTENSION_KEY } from '../protocol';

import { useBotContext } from './Context';
import s from './History.module.scss';

export interface HistoryProps {
  className?: string;
  style?: React.CSSProperties;
}

const MessageItem = observer(function MessageItem(props: { item: Message }) {
  const { item } = props;
  const bot = useBotContext();

  const isCommand = item.pending?.extension.type === ExtensionType.Command;
  const extension = item.extension;
  const showExtension = extension && extension !== GLOBAL_EXTENSION_KEY;

  const content = item.pending ? (isCommand ? item.content : item.pending.response.eventSource.result) : item.content;

  const remove = () => {
    bot.removeMessage(item.uuid);
  };

  return (
    <div
      className={classNames(s.item, {
        request: item.role === Role.User,
        response: item.role !== Role.User,
      })}
    >
      <div className={s.content}>
        {!!showExtension && <span className={s.extension}>#{extension}</span>}
        {content || <LoadingIcon className={s.loading} />}
        <MinusCircleFilled className={s.remove} onClick={remove} />
      </div>
      {!!(item.pending && isCommand) && (
        <div className={s.pending}>
          <Loading model={item.pending?.response.eventSource} />
        </div>
      )}
    </div>
  );
});

export const History = observer(function History(props: HistoryProps) {
  const { className, ...other } = props;
  const bot = useBotContext();
  const containerRef = useRef<HTMLDivElement>(null);

  useEventBusListener(bot.event, on => {
    const scrollToBottom = () => {
      requestAnimationFrame(() => {
        if (containerRef.current) {
          containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
      });
    };
    on('SHOW', () => {
      scrollToBottom();
    });
    on('MESSAGE_ADDED', () => {
      scrollToBottom();
    });
  });

  return (
    <div className={classNames(s.root, className)} ref={containerRef} {...other}>
      {bot.history.map(i => {
        return <MessageItem key={i.uuid} item={i} />;
      })}
    </div>
  );
});
