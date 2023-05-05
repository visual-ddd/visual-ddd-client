import { ExtensionType, registerExtension, responseMessage } from '@/lib/chat-bot';
import { useCanvasModel } from '@/lib/editor';
import { useEffect } from 'react';
import { DomainObjectName, DomainObjectReadableName } from '../dsl/constants';
import { DomainEditorModel } from '../model';
import { createIdentityOpenAIEventSourceModel } from '@/lib/openai-event-source';

const SUPPORTED_TYPES = [
  DomainObjectName.Command,
  DomainObjectName.DTO,
  DomainObjectName.Entity,
  DomainObjectName.Query,
  DomainObjectName.ValueObject,
];

export function useWakeadminFormBot() {
  const { model: canvasModel } = useCanvasModel();
  const model = canvasModel.editorModel as DomainEditorModel;

  useEffect(() => {
    return registerExtension({
      key: '表单组件(测试)',
      match: '表单组件(测试)',
      type: ExtensionType.Message,
      description: '生成 Wakeadmin 表单组件',
      onSend(context) {
        const selected = model.viewStore.selectedNodes;

        const objectes = selected.filter(i => SUPPORTED_TYPES.includes(i.name as DomainObjectName));

        if (objectes.length !== 1) {
          return responseMessage(
            `请选择一个领域对象，目前支持以下领域对象：${SUPPORTED_TYPES.map(i => DomainObjectReadableName[i])}`,
            context
          );
        }

        const domainObject = model.domainObjectStore.getObjectById(objectes[0].id)!;

        const types = domainObject.toTypescript();
        const eventSource = createIdentityOpenAIEventSourceModel();
        const result = eventSource.open('/api/rest/ai/wakeadmin-form', {
          method: 'POST',
          body: {
            types,
            prompt: context.message,
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
