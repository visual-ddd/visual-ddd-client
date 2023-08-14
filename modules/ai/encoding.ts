// https://github.com/dqbd/tiktoken/tree/main/js/src
// https://github.com/openai/openai-cookbook/blob/main/examples/How_to_count_tokens_with_tiktoken.ipynb
import { get_encoding, encoding_for_model, Tiktoken, TiktokenModel } from '@dqbd/tiktoken';
import memoize from 'lodash/memoize';
import { ChatModel, ChatMessage } from './constants';

/**
 * tiktoken 更新不会太频繁，这些需要转换一下
 * @param model
 */
function normalizeChatModel(model: ChatModel): TiktokenModel {
  switch (model) {
    case ChatModel.GPT3_5_TURBO:
    case ChatModel.GPT3_5_TURBO_16K:
      return 'gpt-3.5-turbo';
    case ChatModel.GPT_4:
    case ChatModel.GPT_4_32K:
      return 'gpt-4';
    default:
      throw new Error('Unsupported model: ' + model);
  }
}

const getEncoding = memoize((model: ChatModel) => {
  let encoding: Tiktoken;

  try {
    encoding = encoding_for_model(normalizeChatModel(model));
  } catch (error) {
    console.log('Warning: model not found. Using cl100k_base encoding.');
    encoding = get_encoding('cl100k_base');
  }

  return encoding;
});

export function countTokenForString(message: string, model: ChatModel): number {
  const encoding = getEncoding(model);

  return encoding.encode(message).length;
}

export function countToken(messages: ChatMessage[], model: ChatModel): number {
  const encoding = getEncoding(model);

  const tokensPerMessage = 3;
  const tokensPerName = 1;

  let tokens = 0;

  for (const message of messages) {
    tokens += tokensPerMessage;
    if (message.name) {
      tokens += tokensPerName;
    }

    tokens += encoding.encode(
      // FIXME: 这里把 role 也加上，稍微可能超出实际的大小，但是更安全
      message.role + ' ' + message.content
    ).length;
  }

  tokens += 3; // every reply is primed with <|start|>assistant<|message|>
  return tokens;
}
