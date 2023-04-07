import { useEventBusListener, useIsMacos } from '@/lib/hooks';
import { SendOutlined } from '@ant-design/icons';
import { Mentions, message } from 'antd';
import type { MentionsRef } from 'antd/es/mentions';
import classNames from 'classnames';
import { observer } from 'mobx-react';
import { useEffect, useMemo, useRef } from 'react';

import { useBotContext } from '../BotContext';

import s from './Prompt.module.scss';

export interface PromptProps {}

const AUTO_SIZE = {
  minRows: 1,
  maxRows: 6,
};

const UNREACHABLE_PREFIX = '$$_$__$$$$__$_$';

function useCommit(mode: 'ctrl+enter' | 'enter', commit: () => void) {
  const isMacOs = useIsMacos();
  const sendTooltip =
    mode === 'ctrl+enter'
      ? isMacOs
        ? '⌘ + Enter 发送消息'
        : 'Ctrl + Enter 发送消息'
      : 'Enter 发送消息, Shift + Enter 换行';
  const placeholder = `说点什么吧。输入 # 使用指令，${sendTooltip}`;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const target = e.currentTarget as HTMLTextAreaElement;
    const submit = () => {
      e.preventDefault();
      e.stopPropagation();
      commit();
    };

    const isEnter = e.key === 'Enter';
    if (!isEnter) {
      return;
    }

    // this event could be fired after a user starts entering a Chinese character using a Pinyin IME.
    if (isEnter && e.nativeEvent.isComposing) {
      return;
    }

    // 已经激活了下拉菜单
    if (target.nextElementSibling && target.nextElementSibling.classList.contains('ant-mentions-measure')) {
      return;
    }

    if (mode === 'ctrl+enter') {
      if (e.ctrlKey || e.metaKey) {
        submit();
      }
    } else if (!e.shiftKey && !e.altKey && !e.ctrlKey && !e.metaKey) {
      // 没有使用任何修饰符
      submit();
    }
  };

  return {
    sendTooltip,
    placeholder,
    handleKeyDown,
  };
}

export const Prompt = observer(function Prompt() {
  const rootRef = useRef<HTMLDivElement>(null);
  const bot = useBotContext();
  const mentionsRef = useRef<MentionsRef>(null);
  const options = useMemo(() => {
    return bot.availableExtensionsExceptGlobal.map(i => {
      return {
        label: (
          <div>
            <span className="u-link">#{i.match}</span>
          </div>
        ),
        value: i.match,
        key: i.key,
      };
    });
  }, [bot.availableExtensionsExceptGlobal]);

  const enableMention = bot.prompt.match(/^(#[^\s#]*)?$/);
  const disabled = !bot.prompt.trim();
  const pending = bot.pendingHistory.length > 3;

  const commit = async () => {
    if (disabled) {
      return;
    }

    if (pending) {
      message.warning('当前正在请求的消息过多，请稍后再试');
      return;
    }

    try {
      await bot.commit();
    } catch (err) {
      console.error(err);
      message.error((err as Error).message);
    }
  };

  const { placeholder, handleKeyDown, sendTooltip } = useCommit('enter', commit);

  const focus = () => {
    requestAnimationFrame(() => {
      mentionsRef.current?.focus();
    });
  };

  useEventBusListener(bot.event, on => {
    on('ACTIVE', focus);
  });

  useEffect(focus, []);

  return (
    <div className={s.root} ref={rootRef}>
      <div className={s.prompt} id="chat-bot-prompt">
        <Mentions
          ref={mentionsRef}
          className={s.input}
          autoSize={AUTO_SIZE}
          autoFocus
          value={bot.prompt}
          getPopupContainer={() => rootRef.current!}
          onChange={bot.setPrompt}
          prefix={enableMention ? '#' : UNREACHABLE_PREFIX}
          notFoundContent="未找到相关指令"
          // 已选中禁用
          options={options}
          placeholder={placeholder}
          onKeyDown={handleKeyDown}
          placement="top"
        />
        <SendOutlined className={classNames(s.send, { disable: disabled })} title={sendTooltip} onClick={commit} />
      </div>
    </div>
  );
});
