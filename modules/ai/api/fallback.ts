import { allowMethod } from '@/lib/api';
import { createFailResponse } from '@/modules/backend-node';
import { NextApiHandler } from 'next';
import { chat } from '../chat';
import { ChatMessage, ChatModel, ChatRole } from '../constants';
import { withSessionApiRoute } from '@/modules/session/api-helper';
import { getSupportedModels } from '../platform';

type Payload = {
  system?: string;
  text: string;
  summary?: string;
  model?: string;
  temperature?: number;
  context: [string, string][];
};

export const fallback: NextApiHandler = allowMethod(
  'POST',
  withSessionApiRoute(async (req, res) => {
    const payload = req.body as Payload;

    if (payload.text == null) {
      res.status(400).json(createFailResponse(400, 'text is required'));
      return;
    }

    if (payload.model) {
      if (getSupportedModels().indexOf(payload.model as any) === -1) {
        res.status(400).json(createFailResponse(400, `model ${payload.model} is not supported`));
        return;
      }
    }

    const messages: ChatMessage[] = [];

    if (payload.system) {
      messages.push({
        role: 'system',
        content: payload.system,
      });
    }

    if (payload.summary) {
      messages.push({
        role: 'user',
        content: `以上是之前聊天对话的总结：\n${payload.summary}`,
      });
    }

    if (payload.context) {
      payload.context.forEach(([role, value]) => {
        messages.push({
          role: role as ChatRole,
          content: value,
        });
      });
    }

    messages.push({
      role: 'user',
      content: payload.text,
    });

    chat({
      source: req,
      pipe: res,
      messages,
      model: payload.model as ChatModel,
      temperature: payload.temperature ?? 0.7,
    });
  })
);
