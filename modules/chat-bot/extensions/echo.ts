import { registerExtension, ExtensionType } from '@/lib/chat-bot';
import { OpenAIEventSourceModel } from '@/lib/openai-event-source';

/**
 * 默认全局扩展
 */
registerExtension({
  key: 'ECHO',
  match: 'ECHO',
  type: ExtensionType.Command,
  onSend({ message, bot, currentTarget }) {
    const eventSource = new OpenAIEventSourceModel({ decode: i => i });
    const result = eventSource.open(`/api/ai/echo?text=${message}`);

    result.then(res => {
      bot.responseMessage(res, currentTarget);
    });

    return {
      eventSource,
      result,
    };
  },
});
