import { Button, Input, message, Modal, notification, Tag } from 'antd';
import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { UbiquitousLanguageItem } from './types';
import { request } from '@/modules/backend-client';
import uniq from 'lodash/uniq';

import s from './AIImport.module.scss';
import { NoopArray } from '@wakeapp/utils';

export interface AIImportProps {
  /**
   * 导入
   * @param items
   */
  onImport?: (items: UbiquitousLanguageItem[]) => void;
}

export interface AIImportRef {
  open(): void;
}

export function useAIImport() {
  return useRef<AIImportRef>(null);
}

// random color
const COLORS = ['magenta', 'red', 'volcano', 'orange', 'gold', 'lime', 'green', 'cyan', 'blue', 'geekblue', 'purple'];

function randomColor() {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
}

export const AIImport = forwardRef<AIImportRef, AIImportProps>(function AIImport(props, ref) {
  const [open, setOpen] = useState(false);
  const [paragraph, setParagraph] = useState('');
  const [detecting, setDetecting] = useState(false);
  const [words, setWords] = useState<string[]>(NoopArray);
  const [importing, setImporting] = useState(false);
  const [customTag, setCustomTag] = useState('');

  useImperativeHandle(ref, () => {
    return {
      open() {
        setOpen(true);
      },
    };
  });

  const handleCancel = () => {
    setOpen(false);
    setParagraph('');
    setWords(NoopArray);
  };

  const detectWords = async () => {
    if (!paragraph.trim() || detecting) {
      return;
    }
    try {
      setDetecting(true);
      const ws = await request.requestByGet<string[]>('/api/ai/extra-words', { text: paragraph });
      const uws = uniq(ws);

      if (uws.length) {
        setWords(uws);
      }
    } catch (e) {
      message.error((e as Error).message);
      console.error(e);
    } finally {
      setDetecting(false);
    }
  };

  const removeWord = (word: string) => {
    setWords(words.filter(w => w !== word));
  };

  const importWords = async () => {
    if (!words.length || importing) {
      return;
    }

    try {
      setImporting(true);
      const items = await request.requestByGet<UbiquitousLanguageItem[]>('/api/ai/words-to-ubiquitous-language', {
        words: words.join(','),
      });
      props.onImport?.(items);
      handleCancel();
      notification.success({
        message: '导入成功',
        description: `成功导入 ${items.length} 个统一语言`,
      });
    } catch (e) {
      message.error((e as Error).message);
      console.error(e);
    } finally {
      setImporting(false);
    }
  };

  const handleCustomTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      let value = customTag.trim();
      if (value && !words.includes(value)) {
        setWords([...words, value]);
        setCustomTag('');
      }
    }
  };

  return (
    <Modal
      title="AI 提取"
      open={open}
      onCancel={handleCancel}
      destroyOnClose
      footer={null}
      className={s.root}
      maskClosable={false}
    >
      <div className={s.input}>
        <Input.TextArea
          className={s.text}
          rows={10}
          value={paragraph}
          placeholder="请输入文本"
          onChange={e => setParagraph(e.target.value)}
          showCount
          maxLength={1000}
          disabled={detecting || importing}
        />
        <Button type="primary" disabled={!paragraph.trim() || importing} loading={detecting} onClick={detectWords}>
          开始分析
        </Button>
      </div>
      {!!words.length && (
        <div className={s.words}>
          <h3>识别结果:</h3>

          <div className={s.tags}>
            {words.map(w => (
              <Tag key={w} closable={!importing} onClose={() => removeWord(w)} color={randomColor()}>
                {w}
              </Tag>
            ))}
            <Input
              value={customTag}
              disabled={importing}
              onChange={e => setCustomTag(e.target.value)}
              className={s.customTag}
              placeholder="插入自定义词条"
              onKeyDown={handleCustomTagKeyDown}
            />
          </div>
          <Button block disabled={!words.length} loading={importing} onClick={importWords}>
            开始导入
          </Button>
        </div>
      )}
    </Modal>
  );
});
