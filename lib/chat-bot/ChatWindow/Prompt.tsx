import { useEventBusListener } from '@/lib/hooks';
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

export const Prompt = observer(function Prompt() {
  const bot = useBotContext();
  const mentionsRef = useRef<MentionsRef>(null);

  const handleExtensionChange = (value: string) => {
    const matched = bot.availableExtensions.find(i => i.match === value);

    if (matched) {
      bot.setActiveExtension(matched);
      return true;
    }

    return false;
  };

  const handleMentionSelect = (option: { value?: string }) => {
    if (option.value) {
      handleExtensionChange(option.value);
    }
  };

  const options = bot.availableExtensions.map(i => {
    return { label: i.match, value: i.match };
  });

  const handleKeyUp = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        bot.commit();
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
          prefix="/"
          options={options}
          onSelect={handleMentionSelect}
          placeholder="输入对话，可以使用 / 使用指令"
          onKeyDown={handleKeyUp}
          placement="top"
        />
        <SendOutlined
          className={classNames(s.send, { disable: !bot.prompt.trim() })}
          title="发送 Ctrl/Command + Enter"
          onClick={bot.commit}
        />
      </div>
    </div>
  );
});
