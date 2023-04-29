import { ModelName, Usage } from './types';

export function createGPT35Usage(userId: string, token: number, note?: string) {
  const usage: Usage = {
    userId,
    point: token,
    note: note ?? 'GPT 3.5 token 消耗',
    model: ModelName.GPT35,
    consumer: token,
    createDate: Date.now(),
  };

  return usage;
}
