import { ExtensionType, registerExtension, ResponseError, responseMessage } from '@/lib/chat-bot';
import { useDesignerContext } from '@/lib/designer';
import { useCanvasModel } from '@/lib/editor';
import { createIdentityOpenAIEventSourceModel } from '@/lib/openai-event-source';
import { tryDispose } from '@/lib/utils';
import { useRefValue } from '@wakeapp/hooks';
import { useEffect } from 'react';

import type { DataObjectEditorModel } from '../model';
import { DomainDesignerTabs } from '../../constants';
import { transform } from '../ai-dsl';

const TIP = `请输入提示, 你可以:

- 生成创建 SQL 语句
- 获取积分最多的 10 个用户
- 为用户表创建索引你有什么意见？给出对应的 sql 语句`;

export function useDataObjectSqlMasterBot() {
  const { model: canvasModel } = useCanvasModel();
  const model = canvasModel.editorModel as DataObjectEditorModel;
  const designer = useDesignerContext();

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
      throw ResponseError.create('请先创建数据模型, 你也可以使用 #数据建模 指令快速建模');
    }

    const dsl = tables.map(i => i.dsl);

    const conception = transform(dsl, dsl);

    return conception;
  };

  const getTablesRef = useRefValue(getConception);

  useEffect(() => {
    return registerExtension({
      key: 'SQL专家',
      match: 'SQL专家',
      type: ExtensionType.Message,
      description: '配合数据模型，快速生成 SQL 语句、意见咨询等等',
      keepMatch: true,
      onSend(context) {
        const { message } = context;
        const content = message.trim();

        if (!content) {
          return responseMessage(TIP, context);
        }

        const eventSource = createIdentityOpenAIEventSourceModel();
        const result = (async () => {
          try {
            const conception = await getTablesRef.current();
            await eventSource.open('/api/ai/sql-master', {
              body: {
                conception,
                prompt: message,
              },
              method: 'POST',
            });
          } catch (err) {
            if (ResponseError.isResponseError(err)) {
              eventSource.setResult(err.message);
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
