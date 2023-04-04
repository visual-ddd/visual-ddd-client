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

export const Prompt = observer(function Prompt() {
  const rootRef = useRef<HTMLDivElement>(null);
  const bot = useBotContext();
  const mentionsRef = useRef<MentionsRef>(null);
  const isMacOs = useIsMacos();
  const PLACEHOLDER = isMacOs
    ? '说点什么吧。 输入 # 使用指令, Command + Enter 发送消息'
    : '说点什么吧。 输入 # 使用指令, Ctrl + Enter 发送消息';
  const SEND_PLACEHOLDER = isMacOs ? 'Command + Enter 发送消息' : 'Ctrl + Enter 发送消息';

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

  const handleKeyUp = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        commit();
      }
    }
  };

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
      <div className={s.prompt}>
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
          placeholder={PLACEHOLDER}
          onKeyDown={handleKeyUp}
          placement="top"
        />
        <SendOutlined className={classNames(s.send, { disable: disabled })} title={SEND_PLACEHOLDER} onClick={commit} />
      </div>
    </div>
  );
});
