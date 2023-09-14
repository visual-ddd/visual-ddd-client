import { allowMethod } from '@/lib/api';
import { createFailResponse } from '@/modules/backend-node';
import { NextApiHandler } from 'next';

import { chat } from '../chat';
import { withWakedataRequestApiRoute } from '@/modules/session/api-helper';

/**
 * DDD 专业领域问答
 */
export const dddMaster: NextApiHandler = allowMethod(
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
      bzCode: 'ddd-master',
      bzDesc: 'DDD 专家',
      messages: [
        {
          role: 'system',
          content: `你是一个经验丰富的领域驱动设计(DDD)专家和软件专家。请根据用户的输入给出专业的回答。 `,
        },
        {
          role: 'user',
          content: text,
        },
      ],
      temperature: 1,
    });
  })
);
