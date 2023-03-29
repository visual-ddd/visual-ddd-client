import { registerExtension, ExtensionType } from '@/lib/chat-bot';
import { OpenAIEventSourceModel } from '@/lib/openai-event-source';
import { tryDispose } from '@/lib/utils';
import { Disposer } from '@wakeapp/utils';

/**
 * 默认全局扩展
 */
registerExtension({
  key: 'ECHO',
  match: 'ECHO',
  type: ExtensionType.Command,
  onSend({ message, bot, currentTarget }) {
    const disposer = new Disposer();
    const eventSource = new OpenAIEventSourceModel({ decode: i => i });
    disposer.push(() => tryDispose(eventSource));

    const result = eventSource.open(`/api/ai/echo`, {
      body: {
        text: message,
      },
      method: 'POST',
    });

    result.then(res => {
      bot.responseMessage(res, currentTarget);
    });

    return {
      eventSource,
      result,
      dispose: disposer.release,
    };
  },
});
