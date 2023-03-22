import { Input, message, Modal } from 'antd';
import { observer } from 'mobx-react';
import { useEffect, useState } from 'react';
import { OpenAIEventSourceModelOptions } from './OpenAIEventSourceModel';
import { useOpenAI } from './useOpenAI';

import s from './PromptModal.module.scss';
import { RobotOutlined, SendOutlined } from '@ant-design/icons';
import { Loading } from './Loading';
import { clamp } from 'lodash';

export interface PromptModalProps<T> {
  options: OpenAIEventSourceModelOptions<T>;
  onDone?: (value: T) => void;
  onVisibleChange?: (visible: boolean) => void;
  url: (prompt: string) => string;

  /**
   * 提示语
   */
  placeholder?: string | string[];

  visible?: boolean;
}

const AUTO_SIZE = { minRows: 7 };

function usePlaceholder(placeholder: string | string[] | undefined): string | undefined {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (Array.isArray(placeholder) && placeholder.length) {
      const timer = setInterval(() => {
        setIndex(i => (i + 1) % placeholder.length);
      }, 4000);

      return () => clearInterval(timer);
    }
  }, [placeholder]);

  return Array.isArray(placeholder)
    ? placeholder.length
      ? placeholder[clamp(index, 0, placeholder.length - 1)]
      : undefined
    : placeholder;
}

export const PromptModal = observer(function PromptModal<T>(props: PromptModalProps<T>) {
  const { options, url, onDone, onVisibleChange, placeholder, visible } = props;
  const model = useOpenAI(options, [visible]);
  const [prompt, setPrompt] = useState<string>('');

  const normalizedPlaceholder = usePlaceholder(placeholder);

  const handleSend = async () => {
    if (!prompt.trim().length || model.loading) {
      return;
    }

    try {
      const value = await model.open(url(prompt));
      onDone?.(value);
    } catch (err) {
      message.error((err as Error).message);
      console.error(err);
    }
  };

  const handleCancel = () => {
    onVisibleChange?.(false);
  };

  const handleKeyUp = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        handleSend();
      }
    }
  };

  useEffect(() => {
    if (!visible) {
      setPrompt('');
    }
  }, [visible]);

  return (
    <Modal
      open={visible}
      footer={null}
      title={<RobotOutlined />}
      className={s.root}
      maskClosable={false}
      onCancel={handleCancel}
    >
      <div className={s.body}>
        <Input.TextArea
          maxLength={500}
          onKeyDown={handleKeyUp}
          showCount
          className={s.text}
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          disabled={model.loading}
          autoSize={AUTO_SIZE}
          bordered={false}
          placeholder={normalizedPlaceholder}
        ></Input.TextArea>
        <div className={s.send} onClick={handleSend}>
          {model.loading ? (
            <Loading model={model} />
          ) : (
            <SendOutlined className={s.sendButton} title="发送 Ctrl/Command + Enter" />
          )}
        </div>
        {model.error && <div className={s.error}>{model.error.message}</div>}
      </div>
    </Modal>
  );
});
