import { allowMethod } from '@/lib/api';
import { createFailResponse } from '@/modules/backend-node';
import { NextApiHandler } from 'next';
import { chat } from '../chat';
import { withSessionApiRoute } from '@/modules/session/api-helper';

/**
 * 总结聊天的主题
 */
export const subject: NextApiHandler = allowMethod(
  'POST',
  withSessionApiRoute(async (req, res) => {
    const text = req.body?.text as string;

    if (text == null) {
      res.status(400).json(createFailResponse(400, 'text is required'));
      return;
    }

    chat({
      source: req,
      pipe: res,
      messages: [
        {
          role: 'system',
          content: `用四到五个字来总结聊天的主题，不要解释、不要标点、不要语气词、不要多余文本，如果没有主题，请直接返回"随便聊聊"：

					当前聊天内容："""${text}"""`,
        },
      ],
      temperature: 0.7,
      max_tokens: 10,
      stream: false,
    });
  })
);
