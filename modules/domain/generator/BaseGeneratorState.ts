import { assert } from '@/lib/utils';
import { NameDSL } from '../domain-design/dsl/dsl';
import { IGeneratorState } from './types';

export class BaseGeneratorState<T extends NameDSL> implements IGeneratorState<T> {
  list: T[] = [];

  results: Map<string, T> = new Map();

  save(uuid: string, result: T) {
    assert(!this.results.has(uuid), 'uuid 重复');

    this.list.push(result);
    this.results.set(uuid, result);
  }

  get(uuid: string): T | undefined {
    return this.results.get(uuid);
  }
}
