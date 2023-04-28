import { allowMethod } from '@/lib/api';
import { createFailResponse, createSuccessResponse } from '@/modules/backend-node';
import { NextApiHandler } from 'next';
import { CreateImageRequestSizeEnum } from 'openai';
import { withSessionApiRoute } from '@/modules/session/api-helper';
import { getOpenAIInstance } from '../openai';

const DEFAULT_SIZE: CreateImageRequestSizeEnum = CreateImageRequestSizeEnum._256x256;

function getSize(prompt: string): CreateImageRequestSizeEnum {
  if (prompt.includes('--512')) {
    return CreateImageRequestSizeEnum._512x512;
  } else if (prompt.includes('--1024')) {
    return CreateImageRequestSizeEnum._1024x1024;
  }

  return DEFAULT_SIZE;
}

function trimSize(prompt: string) {
  return prompt.replace(/--512|--1024|--256/g, '');
}

const counter: Map<string, number> = new Map();
const MAX_LIMIT = 20;

const checkLimit = (id: string) => {
  let count = counter.get(id) || 0;

  if (count >= MAX_LIMIT) {
    return true;
  }

  counter.set(id, count + 1);

  return false;
};

/**
 * 使用 openai dall-e 进行图片生成
 */
export const dallE: NextApiHandler = allowMethod(
  'POST',
  withSessionApiRoute(async (req, res) => {
    let { prompt } = req.body as {
      prompt: string;
    };

    if (!prompt) {
      res.status(400).json(createFailResponse(400, 'prompt is required'));
      return;
    }

    if (prompt.length > 1000) {
      res.status(400).json(createFailResponse(400, 'prompt 不能超过 1000 个字符'));
    }

    if (checkLimit(req.session.content!.accountNo)) {
      res.status(400).json(createFailResponse(400, '已达调用次数'));
    }

    const size = getSize(prompt);
    prompt = trimSize(prompt);

    const response = await getOpenAIInstance().createImage({
      prompt,
      n: 1,
      size,
      // response_format: 'b64_json',
    });

    res.json(createSuccessResponse(response.data));
  })
);
