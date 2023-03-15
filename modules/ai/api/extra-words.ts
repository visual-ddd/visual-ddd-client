import { allowMethod } from '@/lib/api';
import { createSuccessResponse } from '@/modules/backend-node';
import { withWakedataRequestApiRoute } from '@/modules/session/api-helper';
import { NextApiHandler } from 'next';
import * as prompt from '../prompts';

export const extraWords: NextApiHandler = allowMethod(
  'GET',
  withWakedataRequestApiRoute(async (req, res) => {
    const text = req.query.text as string;

    if (text == null) {
      res.json(createSuccessResponse([]));
      return;
    }

    const data = await prompt.extraWords(text);

    return res.json(createSuccessResponse(data));
  })
);
