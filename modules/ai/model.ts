import { OpenAI } from 'langchain/llms';
import { OPENAI_API_KEY, OPENAI_BASE_PATH } from './config';

export const openAI = new OpenAI(
  {
    openAIApiKey: OPENAI_API_KEY,
    temperature: 0.7,
    modelName: 'gpt-3.5-turbo-0301',
  },
  {
    basePath: OPENAI_BASE_PATH,
  }
);
