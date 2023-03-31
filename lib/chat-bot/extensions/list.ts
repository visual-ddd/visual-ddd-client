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
          return `${idx + 1}. \`#${i.match}\` ${i.description}`;
        })
        .join('\n')}\n\n需要注意的是:
- **指令是根据当前所处的页面动态注册的**，比如你在数据建模时，可以使用\`#数据建模\`、\`#SQL专家\`等指令
- **指令不会记忆聊天上下文**
`,
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
