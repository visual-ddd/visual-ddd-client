import { registerExtension, GLOBAL_EXTENSION_KEY, ExtensionType, MAX_TOKEN } from '@/lib/chat-bot';
import { createIdentityOpenAIEventSourceModel } from '@/lib/openai-event-source';
import { tryDispose } from '@/lib/utils';
import { Disposer } from '@wakeapp/utils';
import findLast from 'lodash/findLast';

/**
 * 默认全局扩展
 */
registerExtension({
  key: GLOBAL_EXTENSION_KEY,
  type: ExtensionType.Message,
  description: '随便聊聊',
  onSend({ message, bot }) {
    const disposer = new Disposer();
    const context = bot.getRecentlyMessages();
    const token = bot.countToken(context.map(i => i.summary ?? i.content));

    const eventSource = createIdentityOpenAIEventSourceModel();

    disposer.push(() => tryDispose(eventSource));

    const result = (async () => {
      if (token > MAX_TOKEN) {
        // 需要压缩
        const summarySource = createIdentityOpenAIEventSourceModel();
        disposer.push(() => tryDispose(summarySource));

        const summary = await summarySource.open(`/api/ai/summary`, {
          method: 'POST',
          body: {
            text: context
              .filter(i => !i.summary)
              .map(i => i.content)
              .join('\n'),
          },
        });

        const msg = findLast(context, i => !i.summary);
        if (msg) {
          bot.updateSummary(msg.uuid, summary);
        }

        return eventSource.open(`/api/ai/fallback`, {
          method: 'POST',
          body: {
            text: message,
            summary,
          },
        });
      } else {
        return eventSource.open(`/api/ai/fallback`, {
          method: 'POST',
          body: {
            text: message,
            context: context.map(i => {
              const d = i.summary ?? i.content;
              return [i.role, d];
            }),
          },
        });
      }
    })();

    return {
      eventSource,
      result,
      dispose: disposer.release,
    };
  },
});
