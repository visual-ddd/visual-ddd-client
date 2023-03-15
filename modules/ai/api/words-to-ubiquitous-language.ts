import { allowMethod } from '@/lib/api';
import { createSuccessResponse } from '@/modules/backend-node';
import { withWakedataRequestApiRoute } from '@/modules/session/api-helper';
import { NextApiHandler } from 'next';
import { v4 } from 'uuid';
import * as prompt from '../prompts';

export const wordsToUbiquitousLanguage: NextApiHandler = allowMethod(
  'GET',
  withWakedataRequestApiRoute(async (req, res) => {
    const words = req.query.words as string | undefined;

    if (words == null) {
      res.json(createSuccessResponse([]));
      return;
    }

    const data = await prompt.wordsToUbiquitousLanguage(
      words
        .split(',')
        .map(i => i.trim())
        .filter(Boolean)
    );

    data.forEach(i => {
      i.uuid ||= v4();
    });

    return res.json(createSuccessResponse(data));
  })
);
