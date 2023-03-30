import { Tiktoken } from '@dqbd/tiktoken/lite';
import LRUCache from 'lru-cache';

let encoding: Tiktoken | undefined;

export async function encode(text: string): Promise<Uint32Array> {
  if (encoding == null) {
    const Ctor = await (await import('@dqbd/tiktoken')).Tiktoken;
    const base = await (await import('@dqbd/tiktoken/encoders/cl100k_base.json')).default;
    encoding = new Ctor(base.bpe_ranks, base.special_tokens, base.pat_str);
  }

  return encoding.encode(text);
}

const cache = new LRUCache<string, number>({
  max: 100,
});

export async function getTokenCount(text: string): Promise<number> {
  if (cache.has(text)) {
    return cache.get(text)!;
  }

  // https://github.com/transitive-bullshit/chatgpt-api/blob/0984504154ef6cccd2f422638cf5110b8b89831a/src/chatgpt-api.ts#L409
  text = text.replace(/<\|endoftext\|>/g, '');

  const length = (await encode(text)).length;

  cache.set(text, length);

  return length;
}
