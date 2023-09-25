import { createFailResponse } from '@/modules/backend-node';
import get from 'lodash/get';
import { CreateChatCompletionRequest } from 'openai';
import { getOpenAIBaseUrl, getSupportedModels } from '../platform';
import { chat } from '../chat';
import { ChatOptions } from '../constants';
import { allowMethod } from '@/lib/api';
import { withWakedataRequestApiRoute } from '@/modules/session/api-helper';

// process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

/**
 * ChatGPT API 代理
 */
export const chatGptProxy = allowMethod(
  'POST',
  withWakedataRequestApiRoute((req, res) => {
    const supportedModels = getSupportedModels();
    const baseUrl = getOpenAIBaseUrl();

    if (!baseUrl) {
      res.status(500).json(createFailResponse(500, 'OpenAI 未配置'));
      return;
    }

    const body = req.body as CreateChatCompletionRequest | null;

    if (body == null || typeof body !== 'object') {
      res.status(400).json(createFailResponse(400, '请求参数错误'));
      return;
    }

    const model = get(body, 'model');

    if (!model || !supportedModels.includes(model as any)) {
      res.status(400).json(createFailResponse(400, `模型不支持: ${model}`));
      return;
    }

    if (
      body.function_call ||
      body.functions ||
      body.messages.some(i => {
        return !!i.function_call;
      })
    ) {
      res.status(400).json(createFailResponse(400, `暂不支持函数调用`));
      return;
    }

    chat({
      bzCode: 'proxy',
      bzDesc: 'ChatGPT API 代理',
      stream: false,
      ...body,
      preserve: true,
      pipe: res,
      source: req,
    } as ChatOptions);
  })
);
