import { allowMethod } from '@/lib/api';
import { createFailResponse } from '@/modules/backend-node';
import { NextApiHandler } from 'next';
import { chat } from '../chat';
import { withWakedataRequestApiRoute } from '@/modules/session/api-helper';

export const summary: NextApiHandler = allowMethod(
  'POST',
  withWakedataRequestApiRoute(async (req, res) => {
    const text = req.body?.text as string;

    if (text == null) {
      res.status(400).json(createFailResponse(400, 'text is required'));
      return;
    }

    chat({
      source: req,
      pipe: res,
      bzCode: 'summary',
      bzDesc: '总结',
      messages: [
        {
          role: 'system',
          content: '总结一下你和用户的对话，用作后续的上下文提示 prompt，控制在 150 字以内: ',
        },
        {
          role: 'user',
          content: text,
        },
      ],
      // 这个数不要太大，不然会胡说八道
      temperature: 0.5,
    });
  })
);
