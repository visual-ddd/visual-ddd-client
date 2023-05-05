import { ExtensionType, registerExtension, responseMessage } from '@/lib/chat-bot';
import { useCanvasModel } from '@/lib/editor';
import { useEffect } from 'react';
import { DomainObjectName } from '../dsl/constants';
import { TypeType } from '../dsl/dsl';
import type { DomainEditorModel, DomainObjectQuery } from '../model';
import { createIdentityOpenAIEventSourceModel } from '@/lib/openai-event-source';

export function useWakeadminTableBot() {
  const { model: canvasModel } = useCanvasModel();
  const model = canvasModel.editorModel as DomainEditorModel;

  useEffect(() => {
    if (model.scopeId !== 'query') {
      return;
    }

    return registerExtension({
      key: '表格组件(测试)',
      match: '表格组件(测试)',
      type: ExtensionType.Message,
      description: '生成 Wakeadmin 前端表格',
      onSend(context) {
        const selected = model.viewStore.selectedNodes;

        const queries = selected.filter(i => i.name === DomainObjectName.Query);

        if (queries.length !== 1) {
          return responseMessage('请选择一个查询', context);
        }

        const query = queries[0];
        const domainObject = model.domainObjectStore.getObjectById(query.id)! as DomainObjectQuery;
        const resultType = domainObject.dsl.result;

        if (resultType?.type !== TypeType.Reference) {
          return responseMessage('该查询没有绑定返回值', context);
        }

        const resultObject = model.domainObjectStore.getObjectById(resultType.referenceId);
        if (resultObject == null) {
          return responseMessage('该查询没有绑定返回值', context);
        }

        const types = resultObject.toTypescript();
        const prompt = domainObject.dsl.properties.length
          ? `可以通过 ${domainObject.dsl.properties.map(i => i.name).join(',')} 等字段进行查询 \n`
          : '';

        const eventSource = createIdentityOpenAIEventSourceModel();
        const result = eventSource.open('/api/rest/ai/wakeadmin-table', {
          method: 'POST',
          body: {
            types,
            prompt: prompt + context.message,
          },
        });

        return {
          eventSource,
          result,
          dispose: eventSource.dispose,
        };
      },
    });
  }, [model]);
}
