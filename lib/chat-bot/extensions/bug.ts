import { createStaticOpenAIEventSourceModel } from '@/lib/openai-event-source';
import { Noop } from '@wakeapp/utils';
import { captureMessage } from '@sentry/nextjs';

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

    const result = Promise.resolve().then(() => {
      if (msg) {
        captureMessage(msg);
      }
    });

    return {
      eventSource,
      result,
      dispose: Noop,
    };
  },
});
