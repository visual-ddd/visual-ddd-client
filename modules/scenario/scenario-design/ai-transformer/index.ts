import { AITransformerParseError } from '@/lib/ai-directive-parser';
import { Executor, IFlowStore } from './executor';
import { parse } from './parser';

export * from './protocol';
export type { IFlowStore } from './executor';

export function scenarioAITransformer(input: string, store: IFlowStore) {
  const directives = parse(input);

  if (directives == null) {
    throw new AITransformerParseError('解析失败');
  }

  const executor = new Executor({ store });

  return executor.execute(directives);
}
