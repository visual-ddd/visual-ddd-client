import { useEventBusListener, useIsMacos } from '@/lib/hooks';
import { SendOutlined } from '@ant-design/icons';
import { Mentions } from 'antd';
import type { MentionsRef } from 'antd/es/mentions';
import classNames from 'classnames';
import { observer } from 'mobx-react';
import { useRef } from 'react';

import { useBotContext } from './Context';
import s from './Prompt.module.scss';

export interface PromptProps {}

const AUTO_SIZE = {
  minRows: 1,
  maxRows: 6,
};

const UNREACHABLE_PREFIX = '$$_$__$$$$__$_$';

export const Prompt = observer(function Prompt() {
  const bot = useBotContext();
  const mentionsRef = useRef<MentionsRef>(null);
  const isMacOs = useIsMacos();
  const PLACEHOLDER = isMacOs
    ? '说点什么吧。 输入 # 使用指令, Command + Enter 发送消息'
    : '说点什么吧。 输入 # 使用指令, Ctrl + Enter 发送消息';
  const SEND_PLACEHOLDER = isMacOs ? 'Command + Enter 发送消息' : 'Ctrl + Enter 发送消息';

  const options = bot.availableExtensionsExceptGlobal.map(i => {
    return { label: i.match, value: i.match, key: i.key };
  });

  const enableMention = bot.prompt.match(/^(#[^\s#]*)?$/);

  const commit = () => {
    bot.commit();
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

  useEventBusListener(bot.event, on => {
    on('SHOW', () => {
      requestAnimationFrame(() => {
        mentionsRef.current?.focus();
      });
    });
  });

  return (
    <div className={s.root}>
      <div className={s.prompt}>
        <Mentions
          ref={mentionsRef}
          className={s.input}
          autoSize={AUTO_SIZE}
          autoFocus
          value={bot.prompt}
          onChange={bot.setPrompt}
          prefix={enableMention ? '#' : UNREACHABLE_PREFIX}
          notFoundContent="未找到相关指令"
          // 已选中禁用
          options={options}
          placeholder={PLACEHOLDER}
          onKeyDown={handleKeyUp}
          placement="top"
        />
        <SendOutlined
          className={classNames(s.send, { disable: !bot.prompt.trim() })}
          title={SEND_PLACEHOLDER}
          onClick={commit}
        />
      </div>
    </div>
  );
});
