import { ExtensionType, Role, registerExtension, responseMessage } from '@/lib/chat-bot';
import { createIdentityOpenAIEventSourceModel } from '@/lib/openai-event-source';
import { tryDispose } from '@/lib/utils';
import { Button } from 'antd';
import { useEffect } from 'react';

const TIP = '请输入需要进行总结和提炼的内容';

export function useVisionBot(options: { enabled: boolean; insert: (value: string) => void }) {
  useEffect(() => {
    if (!options.enabled) {
      return;
    }

    return registerExtension({
      key: '愿景生成',
      match: '愿景生成',
      type: ExtensionType.Message,
      description: '自动总结和提炼愿景',
      keepMatch: true,
      renderAction(item) {
        if (
          item.role === Role.Assistant &&
          !item.pending &&
          item.content !== TIP &&
          !item.content.includes('无法生成')
        ) {
          return (
            <div>
              <Button type="primary" onClick={() => options.insert(item.content)}>
                立即插入
              </Button>
            </div>
          );
        }
      },
      onSend(context) {
        const { message } = context;
        const content = message.trim();

        if (!content) {
          return responseMessage(TIP, context);
        }

        const eventSource = createIdentityOpenAIEventSourceModel();
        const result = (async () => {
          await eventSource.open('/api/rest/ai/vision', {
            body: {
              text: content,
            },
            method: 'POST',
          });
        })();

        return {
          eventSource,
          result,
          dispose: () => tryDispose(eventSource),
        };
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options.enabled]);
}
