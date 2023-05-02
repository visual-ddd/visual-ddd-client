import { allowMethod } from '@/lib/api';
import { createFailResponse } from '@/modules/backend-node';
import { delay } from '@wakeapp/utils';
import { NextApiHandler } from 'next';
import { chat } from '../chat';

export const echo: NextApiHandler = allowMethod('POST', async (req, res) => {
  const text = req.body?.text as string;

  if (text == null) {
    res.status(400).json(createFailResponse(400, 'text is required'));
    return;
  }

  await delay(3000);

  chat({
    source: req,
    pipe: res,
    messages: [
      {
        role: 'system',
        content: '你是一个 echo 服务，我发给你什么，你就返回什么',
      },
      {
        role: 'user',
        content: text,
      },
    ],
    temperature: 1,
  });
});
