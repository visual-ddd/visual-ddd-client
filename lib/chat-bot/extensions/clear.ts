import { ExtensionType } from '../protocol';
import { registerExtension } from '../registry';
import { createStaticOpenAIEventSourceModel } from '@/lib/openai-event-source';
import { Noop } from '@wakeapp/utils';

/**
 * 默认全局扩展
 */
registerExtension({
  key: '清除会话',
  match: '清除会话',
  type: ExtensionType.Command,
  description: '清除所有会话信息',
  onSend({ bot }) {
    const eventSource = createStaticOpenAIEventSourceModel('', undefined);

    const result = Promise.resolve().then(() => {
      bot.clearHistory();
    });

    return {
      eventSource,
      result,
      dispose: Noop,
    };
  },
});
