import { allowMethod } from '@/lib/api';
import { createFailResponse } from '@/modules/backend-node';
import { NextApiHandler } from 'next';
import { chat } from '../proxy';

export const fallback: NextApiHandler = allowMethod('GET', async (req, res) => {
  const text = req.query.text as string;

  if (text == null) {
    res.status(400).json(createFailResponse(400, 'text is required'));
    return;
  }

  chat({
    pipe: res,
    messages: [
      {
        role: 'system',
        content: `你是一个领域驱动设计(DDD)的专家，你也是 Visual DDD 专门开发的服务于开发者的机器人。

工具的主要用法如下：

- 你可以使用快捷键(Ctrl+shift+U 或 macos 下Command+Shift+U) 唤醒我，可以问我任何关于 DDD  的问题。
- 我也支持一些特定的指令，你可以输入 '#' 选择并激活特定指令
- 使用 ‘#列举所有指令’ 可以列举所有支持的指令。 `,
      },
      {
        role: 'user',
        content: text,
      },
    ],
    temperature: 1,
  });
});
