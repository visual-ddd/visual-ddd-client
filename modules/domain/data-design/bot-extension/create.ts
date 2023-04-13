import { ExtensionType, registerExtension } from '@/lib/chat-bot';
import { useDesignerContext } from '@/lib/designer';
import { useCanvasModel } from '@/lib/editor';
import {
  createStaticOpenAIEventSourceModel,
  looseJSONParse,
  OpenAIEventSourceModel,
  OpenAIEventSourceModelOptions,
} from '@/lib/openai-event-source';
import { tryDispose } from '@/lib/utils';
import { Noop } from '@wakeapp/utils';
import { useRefValue } from '@wakeapp/hooks';
import { message as msg } from 'antd';
import { useEffect } from 'react';

import { DomainDesignerTabs } from '../../constants';
import { DataObjectName } from '../dsl/constants';
import { DataObjectDSL } from '../dsl/dsl';
import { transform } from '../ai-import';

const UNDETERMINED = '[SORRY]';

const options: OpenAIEventSourceModelOptions<DataObjectDSL[]> = {
  decode: value => {
    if (value.includes(UNDETERMINED)) {
      throw new Error(UNDETERMINED);
    }

    const json = looseJSONParse(value);

    return transform(json);
  },
};

const url = (prompt: string) => {
  return `/api/rest/ai/data-object-builder?prompt=${prompt}`;
};

export function useDataObjectCreateBot() {
  const { model: canvasModel } = useCanvasModel();
  const model = canvasModel.editorModel;
  const designer = useDesignerContext();

  const handleImport = async (list: DataObjectDSL[]) => {
    if (!list.length) {
      return;
    }

    // 激活标签
    designer.setActiveTab({ tab: DomainDesignerTabs.DataModel });

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

    await msg.info('正在生成...', 0.8);
    model.mergeUndoCapturing();
    model.event.emit('CMD_RE_LAYOUT');

    msg.success('生成成功');

    // 聚焦
    canvasModel.handleSelect({ cellIds: nodes.map(i => i.id) });
  };

  const handleImportRef = useRefValue(handleImport);

  useEffect(() => {
    return registerExtension({
      key: '数据建模',
      match: '数据建模',
      type: ExtensionType.Command,
      description: '通过自然语言创建数据对象',
      keepMatch: true,
      onSend({ message, bot, currentTarget }) {
        const content = message.trim();

        if (!content) {
          const eventSource = createStaticOpenAIEventSourceModel('', undefined);
          bot.responseMessage(
            `请输入提示, 你可以:

- 描述你的需求，例如：创建一个用户表
- 通过我，你可以创建实体，你可以描述实体的属性、类型、以及实体之间的关系
- 你也可以使用业务语言来描述你的场景，我们会自动推断
- 创建一个用户和房产，一个用户可以拥有多个房产，一个房产也可以被多个用户拥有
- 描述你的业务场景，例如：我是一个电商平台，我有一个订单系统，订单系统有一个订单列表，订单列表有一个订单详情，订单详情有一个订单状态，订单状态有一个订单状态名称，订单状态名称有一个订单状态名称值
          `,
            currentTarget
          );

          return {
            eventSource,
            result: Promise.resolve(),
            dispose: Noop,
          };
        }

        const eventSource = new OpenAIEventSourceModel(options);
        const result = eventSource
          .open(url(content))
          .then(list => handleImportRef.current?.(list))
          .catch(err => {
            if (err.message === '[SORRY]') {
              bot.responseMessage('抱歉，我还不够聪明，无法理解你的意思', currentTarget);
            } else {
              throw err;
            }
          });

        return {
          eventSource,
          result,
          dispose: () => tryDispose(eventSource),
        };
      },
    }) as any;
  }, []);
}
