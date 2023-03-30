import { registerExtension, GLOBAL_EXTENSION_KEY, ExtensionType } from '@/lib/chat-bot';
import { createIdentityOpenAIEventSourceModel } from '@/lib/openai-event-source';
import { tryDispose } from '@/lib/utils';
import { Disposer } from '@wakeapp/utils';

/**
 * 默认全局扩展
 */
registerExtension({
  key: GLOBAL_EXTENSION_KEY,
  type: ExtensionType.Message,
  description: '随便聊聊',
  onSend({ message, bot }) {
    const disposer = new Disposer();

    const eventSource = createIdentityOpenAIEventSourceModel();

    disposer.push(() => tryDispose(eventSource));

    const result = (async () => {
      const context = await bot.getChatContext(message);

      let summary: string | undefined;

      if (context.recommendToSummary) {
        // 需要压缩
        const messageToSummary = await bot.getMessagesToSummary(context.recommendToSummary);

        if (messageToSummary.length) {
          // 需要压缩
          const summarySource = createIdentityOpenAIEventSourceModel();
          disposer.push(() => tryDispose(summarySource));

          summary = await summarySource.open(`/api/ai/summary`, {
            method: 'POST',
            body: {
              text: messageToSummary
                .map(i => `${String(i.role).toUpperCase()}: ${i.summary || i.content}`)
                .join('\n---\n'),
            },
          });

          // 更新 summary
          bot.updateSummary(context.recommendToSummary.uuid, summary);
        }
      }

      return eventSource.open(`/api/ai/fallback`, {
        method: 'POST',
        body: {
          text: message,
          summary,
          context: context.messages.map(i => {
            const d = i.summary ?? i.content;
            return [i.role, d];
          }),
        },
      });
    })();

    return {
      eventSource,
      result,
      dispose: disposer.release,
    };
  },
});
