import { allowMethod } from '@/lib/api';
import { createFailResponse } from '@/modules/backend-node';
import { NextApiHandler } from 'next';
import { chat, ChatMessage, ChatRole } from '../proxy';

type Payload =
  | {
      text: string;
      summary: string;
    }
  | {
      text: string;
      context: [string, string][];
    };

export const fallback: NextApiHandler = allowMethod('POST', async (req, res) => {
  const payload = req.body as Payload;

  if (payload.text == null) {
    res.status(400).json(createFailResponse(400, 'text is required'));
    return;
  }

  const messages: ChatMessage[] = [];

  messages.push({
    role: 'system',
    content: `你是一个领域驱动设计(DDD)的专家，你也是 Visual DDD 专门开发的服务于开发者的机器人。

工具的主要用法如下：

- 你可以使用快捷键(Ctrl+shift+U 或 macos 下Command+Shift+U) 唤醒我，可以问我任何关于 DDD  的问题。
- 我也支持一些特定的指令，你可以输入 '#' 选择并激活特定指令
- 使用 ‘#列举所有指令’ 可以列举所有支持的指令。 `,
  });

  if ('summary' in payload) {
    messages.push({
      role: 'user',
      content: `以上是之前聊天对话的总结：\n${payload.summary}`,
    });
  } else if ('context' in payload) {
    payload.context.forEach(([role, value]) => {
      messages.push({
        role: role as ChatRole,
        content: value,
      });
    });
  }

  messages.push({
    role: 'user',
    content: payload.text,
  });

  chat({
    pipe: res,
    messages,
    temperature: 1,
  });
});
