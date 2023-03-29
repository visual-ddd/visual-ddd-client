import { looseJSONParse, OpenAIEventSourceModelOptions, PromptModal } from '@/lib/openai-event-source';
import { observer } from 'mobx-react';
import { useState } from 'react';
import { useCanvasModel, useEditorModel } from '@/lib/editor';
import { message } from 'antd';

import { DataObjectDSL, DataObjectName } from '../dsl';
import { transform } from '../ai-import';

import s from './AIModal.module.scss';

export interface AIModalProps {}

const options: OpenAIEventSourceModelOptions<DataObjectDSL[]> = {
  decode: value => {
    if (value.includes('[SORRY]')) {
      throw new Error('无法解析你的请求，请换一种描述试试');
    }

    const json = looseJSONParse(value);

    return transform(json);
  },
};

const url = (prompt: string) => {
  return `/api/ai/data-object-builder?prompt=${prompt}`;
};

const placeholder = [
  '请描述你的需求，例如：创建一个用户表',
  '通过我，你可以创建实体，你可以描述实体的属性、类型、以及实体之间的关系',
  '你也可以使用业务语言来描述你的场景，我们会自动推断',
  '创建一个用户和房产，一个用户可以拥有多个房产，一个房产也可以被多个用户拥有',
  '请描述你的业务场景，例如：我是一个电商平台，我有一个订单系统，订单系统有一个订单列表，订单列表有一个订单详情，订单详情有一个订单状态，订单状态有一个订单状态名称，订单状态名称有一个订单状态名称值',
];

/**
 * TODO: 移除
 * @deprecated 使用 chat bot 代替
 */
export const AIModal = observer(function AIModal(props: AIModalProps) {
  const [visible, setVisible] = useState(false);
  const { model } = useEditorModel();
  const { model: canvasModel } = useCanvasModel();

  const handleImport = async (list: DataObjectDSL[]) => {
    if (!list.length) {
      return;
    }

    const nodes = list.map(n =>
      model.commandHandler.createNode({
        id: n.uuid,
        name: DataObjectName.DataObject,
        type: 'node',
        properties: {
          ...n,
          // 推断出来的大小
          size: { width: 250, height: 200 + 30 * n.properties.length },
        },
      })
    );

    setVisible(false);

    await message.info('正在生成...', 0.8);
    model.mergeUndoCapturing();
    model.event.emit('CMD_RE_LAYOUT');

    message.success('生成成功');

    // 聚焦
    canvasModel.handleSelect({ cellIds: nodes.map(i => i.id) });
  };

  return (
    <>
      <PromptModal
        options={options}
        onDone={handleImport}
        url={url}
        visible={visible}
        onVisibleChange={setVisible}
        placeholder={placeholder}
      />
      <div className={s.button} onClick={() => setVisible(true)}>
        AI 建模(实验性)
      </div>
    </>
  );
});
