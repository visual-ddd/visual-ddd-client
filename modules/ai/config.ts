import { assert } from '@/lib/utils';
import { removeTrailingSlash } from '@wakeapp/utils';

export const OPENAI_API_KEY = process.env.OPENAI_API_KEY as string;

/**
 * 可以指定自定义域名和路径，绕过 GFW
 * 注意，v1 版本号也是路径的一部分
 * 比如 https://openai.bobi.ink/v1
 */
export const OPENAI_BASE_PATH = process.env.OPENAI_BASE_PATH && removeTrailingSlash(process.env.OPENAI_BASE_PATH);

assert(OPENAI_API_KEY, 'OPEN_AI_API_KEY is not defined');

export const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
export const PINECONE_ENVIRONMENT = process.env.PINECONE_ENVIRONMENT;
export const PINECONE_INDEX = process.env.PINECONE_INDEX;
