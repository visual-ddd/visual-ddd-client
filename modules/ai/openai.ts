import { Configuration, OpenAIApi } from 'openai';
import { OPENAI_API_KEY, OPENAI_BASE_PATH } from './config';

const configuration = new Configuration({
  apiKey: OPENAI_API_KEY,
  basePath: OPENAI_BASE_PATH,
});

export const openai = new OpenAIApi(configuration);
