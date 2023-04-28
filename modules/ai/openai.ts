import { Configuration, OpenAIApi } from 'openai';
import { getOpenAISupport } from './platform';

export function getOpenAIInstance() {
  const support = getOpenAISupport();

  const configuration = new Configuration({
    apiKey: support.key,
    basePath: support.basePath,
  });

  const openai = new OpenAIApi(configuration);

  return openai;
}
