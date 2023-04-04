import { allowMethod } from '@/lib/api';
import { createFailResponse } from '@/modules/backend-node';
import { NextApiHandler } from 'next';
import { chat } from '../proxy';
import { ChatMessage, ChatRole } from '../constants';

type Payload = {
  system?: string;
  text: string;
  summary?: string;
  context: [string, string][];
};

export const fallback: NextApiHandler = allowMethod('POST', async (req, res) => {
  const payload = req.body as Payload;

  if (payload.text == null) {
    res.status(400).json(createFailResponse(400, 'text is required'));
    return;
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
    pipe: res,
    messages,
    temperature: 1,
  });
});
