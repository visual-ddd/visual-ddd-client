import { Button, Input, message, Modal, notification, Space, Tag } from 'antd';
import { cloneElement, isValidElement, useState } from 'react';
import { UbiquitousLanguageItem } from './types';
import uniq from 'lodash/uniq';
import { NoopArray } from '@wakeapp/utils';
import { Loading, looseJSONParse, OpenAIEventSourceModelOptions, useOpenAI } from '@/lib/openai-event-source';
import { observer } from 'mobx-react';
import { useRefValue } from '@wakeapp/hooks';
import { v4 } from 'uuid';

import s from './AIImport.module.scss';

export interface AIImportProps {
  /**
   * 导入
   * @param items
   */
  onImport?: (items: UbiquitousLanguageItem[]) => void;
  children?: React.ReactNode;
}

// random color
const COLORS = ['magenta', 'red', 'volcano', 'orange', 'gold', 'lime', 'green', 'cyan', 'blue', 'geekblue', 'purple'];

function randomColor() {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
}

const OpenAIOptions: OpenAIEventSourceModelOptions = {
  decode: looseJSONParse,
};

const ImportWordsOpenAIOptions: OpenAIEventSourceModelOptions = {
  decode: w => {
    const d = looseJSONParse<UbiquitousLanguageItem[]>(w);

    return d.map(i => {
      i.uuid = v4();
      return i;
    });
  },
};

export const AIImport = observer(function AIImport(props: AIImportProps) {
  const { children } = props;
  const [open, setOpen] = useState(false);
  const [paragraph, setParagraph] = useState('');
  const [words, setWords] = useState<string[]>(NoopArray);
  const [customTag, setCustomTag] = useState('');
  const detectWords = useOpenAI<string[]>(OpenAIOptions, [open]);
  const importWords = useOpenAI<UbiquitousLanguageItem[]>(ImportWordsOpenAIOptions, [open]);

  const detecting = detectWords.loading;
  const importing = importWords.loading;
  const openRef = useRefValue(open);

  const handleCancel = () => {
    setOpen(false);
    setParagraph('');
    setWords(NoopArray);
  };

  const handleDetectWords = async () => {
    if (!paragraph.trim() || detecting) {
      return;
    }

    try {
      const ws = await detectWords.open(`/api/ai/extra-words?text=${paragraph}`);
      if (!openRef.current) {
        return;
      }
      const uws = uniq(ws);

      if (uws.length) {
        setWords(uws);
      }
    } catch (e) {
      message.error((e as Error).message);
    }
  };

  const removeWord = (word: string) => {
    setWords(words.filter(w => w !== word));
  };

  const handleImportWords = async () => {
    if (!words.length || importing || detecting) {
      return;
    }

    try {
      const items = await importWords.open(`/api/ai/words-to-ubiquitous-language?words=${words.join(',')}`);

      if (!openRef.current) {
        return;
      }

      props.onImport?.(items);
      handleCancel();
      notification.success({
        message: '导入成功',
        description: `成功导入 ${items.length} 个统一语言`,
      });
    } catch (e) {
      message.error((e as Error).message);
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

  const handleShow = () => {
    setOpen(true);
  };

  return (
    <>
      {isValidElement(children) &&
        cloneElement(children, {
          // @ts-expect-error
          onClick: handleShow,
        })}
      <Modal
        title="AI 提取（实验性）"
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
          <Space>
            <Button
              type="primary"
              disabled={!paragraph.trim() || importing}
              loading={detecting}
              onClick={handleDetectWords}
            >
              开始分析
            </Button>
            <Loading model={detectWords} />
          </Space>
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
            <Space>
              <Button block disabled={!words.length} loading={importing} onClick={handleImportWords}>
                开始导入
              </Button>
              <Loading model={importWords} />
            </Space>
          </div>
        )}
      </Modal>
    </>
  );
});
