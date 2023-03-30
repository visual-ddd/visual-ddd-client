import { ChatContext, Message } from './protocol';
import { getTokenCount } from './tokenizer';
import {
  MAX_CONTEXT_PROMPT_LENGTH as MAX_CONTEXT_TOKEN_LENGTH,
  MAX_CONTEXT_MESSAGE as MAX_CONTEXT_MESSAGE_LENGTH,
} from './constants';

/**
 * 聊天上下文计算
 */
export async function calculateContext(prompt: string, history: Message[]): Promise<ChatContext> {
  /**
   * 当前 token
   */
  const promptToken = await getTokenCount(prompt);
  let contextToken = promptToken;

  /**
   * 推荐进行总结的位置
   */
  let recommendToSummary: Message | undefined;

  const list: Message[] = [];

  for (let i = history.length - 1; i >= 0; i--) {
    const message = history[i];
    const isPending = !!message.pending;

    // 正在进行
    if (isPending) {
      continue;
    }

    const isSummary = !!message.summary;
    const content = message.summary || message.content;

    if (!content) {
      continue;
    }

    const token = message.token ?? (await getTokenCount(content));

    const nextTokens = contextToken + token;

    // 如果超过了最大上下文 token 数
    if (nextTokens > MAX_CONTEXT_TOKEN_LENGTH) {
      // 溢出了，推荐进行总结的点
      if (list.length < MAX_CONTEXT_MESSAGE_LENGTH) {
        // 推荐进行总结
        recommendToSummary = message;
      }

      break;
    }

    list.unshift(message);
    contextToken = nextTokens;

    // 到达数量限制
    if (list.length >= MAX_CONTEXT_MESSAGE_LENGTH) {
      break;
    }

    // 遍历直到找到 summary
    if (isSummary) {
      break;
    }
  }

  return { prompt, messages: list, token: contextToken, promptToken, recommendToSummary };
}
