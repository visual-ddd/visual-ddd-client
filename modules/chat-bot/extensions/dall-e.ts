import { registerExtension, ExtensionType, responseMessage } from '@/lib/chat-bot';
import { createStaticOpenAIEventSourceModel } from '@/lib/openai-event-source';
import { request } from '@/modules/backend-client';

/**
 * 默认DALL-E 生成图片
 */
registerExtension({
  key: 'DALL-E(测试)',
  match: 'DALL-E(测试)',
  type: ExtensionType.Command,
  description: 'DALL-E AI 生成图片',
  onSend(context) {
    const { message, bot, currentTarget } = context;

    if (!message.trim()) {
      return responseMessage(
        `请输入图片描述, 例如：一只白色的猫

> 默认返回 256x256, 你可以通过 --512 参数来返回 512x512 的图片, 或者 --1024 参数来返回 1024x1024 的图片
			`,
        context
      );
    }

    let disposed = false;
    const eventSource = createStaticOpenAIEventSourceModel('生成中', undefined);
    eventSource.setLoading(true);

    const result = (async () => {
      const data = await request.requestByPost<{ data: { url: string }[] }>('/api/rest/ai/dall-e', {
        prompt: message,
      });

      if (disposed) {
        return;
      }

      const inMarkdown = `${data.data
        .map(i => {
          return `![image](${i.url})`;
        })
        .join('\n')}`;

      bot.responseMessage(inMarkdown, currentTarget);
    })();

    result.finally(() => {
      eventSource.setLoading(false);
    });

    return {
      eventSource,
      result,
      dispose: () => {
        disposed = true;
      },
    };
  },
});
