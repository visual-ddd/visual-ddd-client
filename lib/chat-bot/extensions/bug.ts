import { createStaticOpenAIEventSourceModel } from '@/lib/openai-event-source';
import { Noop } from '@wakeapp/utils';
import { captureMessage } from '@sentry/nextjs';
import { getSession } from '@/modules/session';

import { ExtensionType } from '../protocol';
import { registerExtension } from '../registry';

/**
 * 默认全局扩展
 */
registerExtension({
  key: 'BUG',
  match: 'BUG',
  type: ExtensionType.Message,
  description: 'BUG 报告',
  onSend({ bot, message }) {
    const msg = message.trim();
    const response = msg ? '谢谢你的反馈，我们会尽快处理您反馈的意见' : '请输入您的反馈意见';
    const eventSource = createStaticOpenAIEventSourceModel(response, undefined);

    const run = async () => {
      if (!msg) {
        return;
      }

      const context = await bot.getChatContext('');
      const session = await getSession();
      const content = `[BUG REPORT]

# 上下文信息

${context.messages.map(i => `${i.role}: ${i.content}`).join('\n')}

# 反馈消息

${msg}

# 反馈用户
${session.user.userName}: ${session.user.accountNo}
`;

      captureMessage(content);
    };

    run();

    return {
      eventSource,
      result: Promise.resolve(),
      dispose: Noop,
    };
  },
});
