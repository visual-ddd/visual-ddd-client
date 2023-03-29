import { allowMethod } from '@/lib/api';
import { createFailResponse } from '@/modules/backend-node';
import { delay } from '@wakeapp/utils';
import { NextApiHandler } from 'next';
import { chat } from '../proxy';

export const summary: NextApiHandler = allowMethod('POST', async (req, res) => {
  const text = req.body?.text as string;

  if (text == null) {
    res.status(400).json(createFailResponse(400, 'text is required'));
    return;
  }

  await delay(10000);

  chat({
    pipe: res,
    messages: [
      {
        role: 'system',
        content: '简要总结一下你和用户的对话，用作后续的上下文提示 prompt，控制在 50 字以内',
      },
      {
        role: 'user',
        content: text,
      },
    ],
    temperature: 1,
  });
});
