import { ExtensionType, IBot, registerExtension, ResponseError, responseMessage } from '@/lib/chat-bot';
import { useDesignerContext } from '@/lib/designer';
import { useCanvasModel } from '@/lib/editor';
import { createIdentityOpenAIEventSourceModel } from '@/lib/openai-event-source';
import { tryDispose } from '@/lib/utils';
import { useRefValue } from '@wakeapp/hooks';
import { useEffect } from 'react';
import uniq from 'lodash/uniq';

import type { DataObjectEditorModel } from '../../model';
import { DomainDesignerTabs } from '../../../constants';
import { transform as transformToConceptionDSL } from '../../ai-dsl';
import { TableStore } from './TableStore';
import { AITransformer, AITransformerParseError } from '../../ai-transformer';

const TIP = `请输入提示, 你可以:

- 描述你的需求，例如：创建一个用户表
- 通过我，你可以创建实体，你可以描述实体的属性、类型、以及实体之间的关系
- 你也可以使用业务语言来描述你的场景，我们会自动推断
- 创建一个用户和房产，一个用户可以拥有多个房产，一个房产也可以被多个用户拥有
- 描述你的业务场景，例如：我是一个电商平台，我有一个订单系统，订单系统有一个订单列表，订单列表有一个订单详情，订单详情有一个订单状态，订单状态有一个订单状态名称，订单状态名称有一个订单状态名称值
- 对表进行操作, 例如: 给所有表添加创建时间和更新时间


技巧：

- 显式描述实体之间的关系：一对一，多对多，一对多，多对一等等
`;

export function useDataObjectBot() {
  const { model: canvasModel } = useCanvasModel();
  const model = canvasModel.editorModel as DataObjectEditorModel;
  const designer = useDesignerContext();

  /**
   * 获取概念模型
   * @returns
   */
  const getConception = async () => {
    // 激活标签
    designer.setActiveTab({ tab: DomainDesignerTabs.DataModel });

    // 数据验证
    const invalid = await model.validate();

    if (invalid) {
      throw ResponseError.create('数据验证失败, 请先修复数据模型的相关警告');
    }

    const tables = model.dataObjectStore.objectsInArray;

    if (!tables.length) {
      return '';
    }

    const tableDSLList = tables.map(i => i.dsl);

    const conception = transformToConceptionDSL(tableDSLList, tableDSLList, { useCase: 'conception' });

    return conception;
  };

  const run = async (result: string, onMessage: (message: string) => void) => {
    const store = new TableStore({
      editorModel: model,
      onMessage,
    });
    const transformer = new AITransformer(store);
    transformer.transform(result);

    store.exec();

    return store.warning;
  };

  const getTablesRef = useRefValue(getConception);
  const runRef = useRefValue(run);

  useEffect(() => {
    return registerExtension({
      key: '数据建模(测试)',
      match: '数据建模(测试)',
      type: ExtensionType.Command,
      description: '数据模型创建和修改',
      keepMatch: true,
      onSend(context) {
        const { message } = context;
        const content = message.trim();

        if (!content) {
          return responseMessage(TIP, context);
        }

        const eventSource = createIdentityOpenAIEventSourceModel();
        const result = (async () => {
          let rawResponse: string;
          try {
            const conception = await getTablesRef.current();
            const res = (rawResponse = await eventSource.open('/api/rest/ai/data-object', {
              body: {
                conception,
                text: message,
              },
              method: 'POST',
            }));

            let logMessage: ReturnType<IBot['responseMessage']>;
            const addLog = (log: string) => {
              if (logMessage == null) {
                logMessage = context.bot.responseMessage('执行中...', context.currentTarget);
              }
              logMessage(cur => {
                return cur + '  \n' + log;
              });
            };

            console.debug('AI数据建模:', res);
            const warning = await runRef.current(res, log => {
              addLog(log);
            });

            if (warning.length) {
              console.debug('AI数据建模警告: ', warning);
              addLog(
                '\n执行完成，以下是一些警告信息: \n\n' +
                  uniq(warning)
                    .map(i => `- ${i}`)
                    .join('  \n')
              );
            } else {
              addLog('\n执行成功');
            }
          } catch (err) {
            if (AITransformerParseError.isAITransformerParseError(err)) {
              context.bot.responseMessage(rawResponse!, context.currentTarget);
            } else if (ResponseError.isResponseError(err)) {
              context.bot.responseMessage(err.message, context.currentTarget);
            } else {
              throw err;
            }
          }
        })();

        return {
          eventSource,
          result,
          dispose: () => tryDispose(eventSource),
        };
      },
    }) as any;
  }, []);
}
