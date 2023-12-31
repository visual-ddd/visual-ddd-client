/* eslint-disable @next/next/no-img-element */
import { Tooltip, message } from 'antd';
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
import { CopyIcon } from './CopyIcon';
import { StopIcon } from './StopIcon';

export interface HistoryProps {
  className?: string;
  style?: React.CSSProperties;
  intro?: React.ReactNode;
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
  const extensionDefine = extension ? bot.getExtension(extension) : undefined;
  const isRequest = item.role === Role.User;

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

  const normalizedMarkdownContent = useMemo(() => {
    if (showExtension) {
      return `\`#${extension}\`${content.startsWith('`') ? '\n' + content : ' ' + content}`;
    } else {
      return content;
    }
  }, [showExtension, extension, content]);

  const handleCopy = () => {
    const text = showExtension ? `#${extension} ${content}` : content;

    navigator.clipboard
      .writeText(text)
      .then(res => {
        message.success('已复制');
      })
      .catch(err => {
        message.success(`复制失败: ${err.message}`);
      });
  };

  /**
   * 停止生成
   */
  const handleStop = () => {
    bot.stop(item.uuid);
  };

  const extensionActions = extensionDefine?.renderAction?.(item);

  return (
    <div
      className={classNames(s.item, {
        request: isRequest,
        response: !isRequest,
        loading: item.pending,
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
        {normalizedMarkdownContent ? (
          isRequest ? (
            <div className={classNames('markdown-body', 'dark')}>
              <p className={s.prevContent}>
                {showExtension && <code>{extension}</code>}
                {content && ' ' + content}
              </p>
            </div>
          ) : (
            <Markdown content={normalizedMarkdownContent} className={classNames('dark', { loading })}></Markdown>
          )
        ) : loading ? (
          <LoadingIcon className={s.loading} />
        ) : undefined}
        {item.error && (
          <div className={s.alert}>
            {item.error.message}
            <a className="u-pointer u-link" onClick={() => bot.suppressError(item.uuid)}>
              关闭
            </a>
          </div>
        )}
        {!!extensionActions && <div className={s.extensionActions}>{extensionActions}</div>}
        <div className={s.actions}>
          {item.pending && (
            <Tooltip title="停止" placement="bottom" mouseEnterDelay={0.4}>
              <StopIcon className={s.stopIcon} onClick={handleStop} />
            </Tooltip>
          )}
          {!item.pending && (
            <>
              <Tooltip title="复制" placement="bottom" mouseEnterDelay={0.4}>
                <CopyIcon className={s.copy} onClick={handleCopy} />
              </Tooltip>
              <Tooltip title="删除" placement="bottom" mouseEnterDelay={0.4}>
                <MinusCircleFilled className={s.remove} onClick={remove} />
              </Tooltip>
            </>
          )}
        </div>
      </div>
    </div>
  );
});

export const History = observer(function History(props: HistoryProps) {
  const { className, intro, ...other } = props;
  const bot = useBotContext();
  const containerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useMemo(() => {
    return rafDebounce((messageId?: string) => {
      const scroll = () => {
        if (containerRef.current) {
          containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
      };
      if (messageId) {
        const element = document.querySelector(`[data-uuid="${messageId}"]`) as HTMLDivElement | undefined;
        if (element) {
          scroll();
          return;
        } else {
          // 加一个延时，因为消息插入时 DOM 未必已经挂载
          setTimeout(() => {
            scrollToBottom();
          }, 500);
          return;
        }
      }

      scroll();
    });
  }, []);

  useEventBusListener(bot.event, on => {
    on('ACTIVE', () => {
      scrollToBottom();
    });
    on('HISTORY_LOADED', () => {
      setTimeout(() => {
        scrollToBottom();
      }, 100);
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
        {intro ? (
          intro
        ) : (
          <>
            <p>
              <code>Visual DDD ChatBot</code> 是一个 AI 聊天机器人，你可以问它任何关于 DDD 的问题。基本用法如下：{' '}
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
          </>
        )}
      </div>
      {bot.history.map(i => {
        return <MessageItem key={i.uuid} item={i} />;
      })}
    </div>
  );
});
