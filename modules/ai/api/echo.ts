import { allowMethod } from '@/lib/api';
import { createFailResponse } from '@/modules/backend-node';
import { delay } from '@wakeapp/utils';
import { NextApiHandler } from 'next';
import { chat } from '../proxy';

export const echo: NextApiHandler = allowMethod('GET', async (req, res) => {
  const text = req.query.text as string;

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
