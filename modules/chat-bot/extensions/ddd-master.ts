import { registerExtension, ExtensionType, responseMessage } from '@/lib/chat-bot';
import { OpenAIEventSourceModel } from '@/lib/openai-event-source';

/**
 * DDD 问题反馈
 */
registerExtension({
  key: 'DDD专家',
  match: 'DDD专家',
  type: ExtensionType.Message,
  description: 'DDD 领域问题咨询',
  keepMatch: true,
  onSend(context) {
    const { message } = context;
    if (!message.trim()) {
      return responseMessage('我是 DDD 专家，你可以问我任何问题，我会尽力为你解答。', context);
    }

    const eventSource = new OpenAIEventSourceModel({ decode: i => i });

    const result = eventSource.open(`/api/rest/ai/ddd-master`, {
      body: {
        text: message,
      },
      method: 'POST',
    });

    return {
      eventSource,
      result,
      dispose: eventSource.dispose,
    };
  },
});
