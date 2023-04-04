/* eslint-disable @next/next/no-img-element */
import { Markdown } from '@/lib/components/Markdown';
import { useEventBusListener } from '@/lib/hooks';
import { Loading, LoadingIcon } from '@/lib/openai-event-source';
import { MinusCircleFilled } from '@ant-design/icons';
import { rafDebounce } from '@wakeapp/utils';
import classNames from 'classnames';
import { observer } from 'mobx-react';
import { useEffect, useMemo, useRef } from 'react';

import { Message, Role, ExtensionType, GLOBAL_EXTENSION_KEY } from '../protocol';
import { useBotContext } from '../BotContext';

import s from './History.module.scss';

export interface HistoryProps {
  className?: string;
  style?: React.CSSProperties;
}

function scrollIntoView(el: HTMLDivElement) {
  el.scrollIntoView({
    behavior: 'smooth',
    block: 'end',
  });
}

const MessageItem = observer(function MessageItem(props: { item: Message }) {
  const { item } = props;
  const bot = useBotContext();
  const elRef = useRef<HTMLDivElement>(null);

  const isCommand = item.pending?.extension.type === ExtensionType.Command;
  const extension = item.extension;
  const showExtension = extension && extension !== GLOBAL_EXTENSION_KEY;
  const isLastItem = bot.history[bot.history.length - 1] === item;

  const content = item.pending ? (isCommand ? item.content : item.pending.response.eventSource.result) : item.content;
  const loading = item.pending && !isCommand;

  const remove = () => {
    bot.removeMessage(item.uuid);
  };

  useEffect(() => {
    if (item.pending && isLastItem) {
      // 滚动底部
      if (elRef.current) {
        scrollIntoView(elRef.current);
      }
    }
  }, [item.pending, content, isLastItem]);

  const normalizedContent = useMemo(() => {
    if (showExtension) {
      return `\`#${extension}\` ${content}`;
    } else {
      return content;
    }
  }, [showExtension, extension, content]);

  return (
    <div
      className={classNames(s.item, {
        request: item.role === Role.User,
        response: item.role !== Role.User,
      })}
      data-uuid={item.uuid}
      ref={elRef}
    >
      {!!(item.pending && isCommand) && (
        <div className={s.pending}>
          <Loading model={item.pending?.response.eventSource} />
        </div>
      )}
      <div className={s.content}>
        {normalizedContent ? (
          <Markdown content={normalizedContent} className={classNames('dark', { loading })}></Markdown>
        ) : loading ? (
          <LoadingIcon className={s.loading} />
        ) : undefined}
        <MinusCircleFilled className={s.remove} onClick={remove} />
      </div>
    </div>
  );
});

export const History = observer(function History(props: HistoryProps) {
  const { className, ...other } = props;
  const bot = useBotContext();
  const containerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useMemo(() => {
    return rafDebounce((messageId?: string) => {
      if (messageId) {
        const element = document.querySelector(`[data-uuid="${messageId}"]`) as HTMLDivElement | undefined;
        if (element) {
          scrollIntoView(element);
          return;
        } else {
          // 加一个延时，因为消息插入时 DOM 未必已经挂载
          setTimeout(() => {
            scrollToBottom();
          }, 500);
          return;
        }
      }
      if (containerRef.current) {
        containerRef.current.scrollTop = containerRef.current.scrollHeight;
      }
    });
  }, []);

  useEventBusListener(bot.event, on => {
    on('ACTIVE', () => {
      scrollToBottom();
    });
    on('MESSAGE_ADDED', ({ message }) => {
      scrollToBottom(message.uuid);
    });
  });

  useEffect(() => {
    scrollToBottom();
  }, []);

  return (
    <div className={classNames(s.root, className)} ref={containerRef} {...other}>
      <div className={s.intro}>
        <img className={s.logo} src="/logo.svg" alt="logo" />
        <h1>欢迎使用 Visual DDD ChatBot</h1>
        <p>
          <code>Visual DDD ChatBot</code> 是基于 <code>ChatGPT</code> 的聊天机器人，你可以问它任何关于 DDD
          的问题。基本用法如下：{' '}
        </p>
        <ol>
          <li>
            你可以使用快捷键(<code>Ctrl+shift+U</code> 或 MacOS 下 <code>Command+Shift+U</code>) 唤醒我
          </li>
          <li>
            我也支持一些特定的指令，你可以输入 <code>#</code> 选择并激活特定指令
          </li>
          <li> 随便聊聊吧 </li>
        </ol>
        <p>
          目前，
          <b>
            ChatBot 还是一个实验性的功能, 如果你遇到任何问题，可以 <code>#BUG</code> 给我们反馈问题, 谢谢
          </b>
          。
        </p>
      </div>
      {bot.history.map(i => {
        return <MessageItem key={i.uuid} item={i} />;
      })}
    </div>
  );
});
