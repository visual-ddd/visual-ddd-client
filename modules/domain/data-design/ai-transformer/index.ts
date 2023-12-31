import { parse, groupByTable } from './parser';
import { Executor, ITableStore } from './executor';
import { AITransformerParseError } from '@/lib/ai-directive-parser';

export { AITransformerParseError } from '@/lib/ai-directive-parser';

export type { ITable, ITableStore } from './executor';
export { parseReference } from './parser';

export class AITransformer {
  private store: ITableStore;

  constructor(store: ITableStore) {
    this.store = store;
  }

  transform(result: string) {
    const directives = parse(result);

    if (directives == null) {
      throw new AITransformerParseError('解析失败');
    }

    const groups = groupByTable(directives);

    const executor = new Executor({ store: this.store });

    executor.execute(groups);
  }
}
