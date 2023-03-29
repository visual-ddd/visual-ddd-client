import { ExtensionType } from '../protocol';
import { registerExtension } from '../registry';
import { createStaticOpenAIEventSourceModel } from '@/lib/openai-event-source';
import { Noop } from '@wakeapp/utils';

/**
 * 默认全局扩展
 */
registerExtension({
  key: '列举指令',
  match: '列举指令',
  type: ExtensionType.Message,
  description: '列举当前上下文支持的指令',
  onSend({ bot }) {
    const eventSource = createStaticOpenAIEventSourceModel(
      `当前上下文支持以下指令:\n\n${bot.availableExtensionsExceptGlobal
        .map((i, idx) => {
          return `${idx + 1}. #${i.match} ${i.description}`;
        })
        .join('\n')}\n\n需要注意的是，插件是根据当前所处的页面动态注册，比如你在数据建模时，可以使用数据建模相关的属性`,
      undefined
    );

    const result = Promise.resolve();

    return {
      eventSource,
      result,
      dispose: Noop,
    };
  },
});
