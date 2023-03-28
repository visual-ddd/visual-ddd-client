import { OpenAIEventSourceModel } from '@/lib/openai-event-source';
import { ExtensionType, GLOBAL_EXTENSION_KEY } from '../protocol';
import { registerExtension } from '../registry';

registerExtension({
  key: GLOBAL_EXTENSION_KEY,
  type: ExtensionType.Message,
  onSend(message) {
    const eventSource = new OpenAIEventSourceModel({
      decode: data => data,
    });
    eventSource.result = message.message;

    return {
      eventSource,
      result: Promise.resolve(),
    };
  },
});

registerExtension({
  key: 'echo',
  match: 'echo',
  type: ExtensionType.Message,
  onSend(message) {
    const eventSource = new OpenAIEventSourceModel({
      decode: data => data,
    });
    eventSource.result = message.message;

    return {
      eventSource,
      result: Promise.resolve(),
    };
  },
});

export { ChatWindow as default } from './ChatWindow';
