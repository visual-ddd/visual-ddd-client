import { assert } from '@/lib/utils';
import { removeTrailingSlash } from '@wakeapp/utils';

export const OPENAI_API_KEY = process.env.OPENAI_API_KEY as string;

/**
 * 可以指定自定义路径，绕过 GFW
 */
export let OPENAI_BASE_PATH = process.env.OPENAI_BASE_PATH && removeTrailingSlash(process.env.OPENAI_BASE_PATH);

assert(OPENAI_API_KEY, 'OPEN_AI_API_KEY is not defined');
