import { registerExtension, GLOBAL_EXTENSION_KEY, ExtensionType } from '@/lib/chat-bot';
import { OpenAIEventSourceModel } from '@/lib/openai-event-source';

/**
 * 默认全局扩展
 */
registerExtension({
  key: GLOBAL_EXTENSION_KEY,
  type: ExtensionType.Message,
  onSend({ message }) {
    const eventSource = new OpenAIEventSourceModel({ decode: i => i });
    const result = eventSource.open(`/api/ai/fallback?text=${message}`);

    return {
      eventSource,
      result,
    };
  },
});
