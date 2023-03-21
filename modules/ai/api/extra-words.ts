import { allowMethod } from '@/lib/api';
import { createFailResponse } from '@/modules/backend-node';
import { withWakedataRequestApiRoute } from '@/modules/session/api-helper';
import { NextApiHandler } from 'next';
import { chat } from '../proxy';

export const extraWords: NextApiHandler = allowMethod(
  'GET',
  withWakedataRequestApiRoute(async (req, res) => {
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
          content: 'You are a language expert, skilled at summarizing.',
        },
        {
          role: 'user',
          content: `Summarize and extract the important nouns and verbs from the text. You response JSON array, don't explain it, for example ["hello", "world"]. The text is: '''${text}'''`,
        },
      ],
      temperature: 0.5,
    });
  })
);
