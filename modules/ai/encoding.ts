// https://github.com/dqbd/tiktoken/tree/main/js/src
// https://github.com/openai/openai-cookbook/blob/main/examples/How_to_count_tokens_with_tiktoken.ipynb
import { get_encoding, encoding_for_model, Tiktoken } from '@dqbd/tiktoken';
import memoize from 'lodash/memoize';
import { ChatModel, ChatMessage } from './constants';

const getEncoding = memoize((model: ChatModel) => {
  let encoding: Tiktoken;

  try {
    encoding = encoding_for_model(model);
  } catch (error) {
    console.log('Warning: model not found. Using cl100k_base encoding.');
    encoding = get_encoding('cl100k_base');
  }

  return encoding;
});

/**
 * 固定 model, gpt3.5 类似于 latest 这样的标签，同时指向最新的，因此可能变动
 * @param model
 * @returns
 */
export const normalizeModel = (model: ChatModel) => {
  if (model === ChatModel.GPT3_5_TURBO) {
    console.warn('Warning: gpt-3.5-turbo may change over time. Returning num tokens assuming gpt-3.5-turbo-0301.');
    return ChatModel.GPT3_5_TURBO_0301;
  } else if (model === ChatModel.GPT_4) {
    console.warn('Warning: gpt-4 may change over time. Returning num tokens assuming gpt-4-0314.');
    return ChatModel.GPT_4_0314;
  }

  return model;
};

export function countToken(messages: ChatMessage[], model: ChatModel): number {
  const encoding = getEncoding(model);

  let tokensPerMessage = 0;
  let tokensPerName = 0;

  if (model === ChatModel.GPT3_5_TURBO_0301) {
    tokensPerMessage = 4; // every message follows <|start|>{role/name}\n{content}<|end|>\n
    tokensPerName = -1; // if there's a name, the role is omitted
  } else if (model === ChatModel.GPT_4_0314) {
    tokensPerMessage = 3;
    tokensPerName = 1;
  }

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
