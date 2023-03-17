import type { CommandDSL, DTODSL, EntityDSL, IDDSL, NameDSL, QueryDSL, ValueObjectDSL } from '../domain-design/dsl/dsl';
import { createIDDSL } from '../domain-design/dsl/factory';

/**
 * 领域对象转换器
 */
export interface IDomainObjectTransform {
  toCommand(): CommandDSL;
  toQuery(): QueryDSL;
  toEntity(): EntityDSL;
  toDTO(): DTODSL;
  toValueObject(): ValueObjectDSL;
}

export abstract class Transform<T extends NameDSL> {
  current: T;

  constructor(current: T) {
    this.current = current;
  }

  /**
   * DSL 克隆
   * 这里可能需要对一些属性进行特殊处理
   */
  abstract clone(): T;
  abstract toCommand(): CommandDSL;
  abstract toQuery(): QueryDSL;
  abstract toEntity(): EntityDSL;
  abstract toDTO(): DTODSL;
  abstract toValueObject(): ValueObjectDSL;

  protected regenerateUUIDList<I extends IDDSL = IDDSL>(list?: I[]) {
    return list?.map(this.regenerateUUID);
  }

  protected regenerateUUID<I extends IDDSL = IDDSL>(input: I) {
    input.uuid = createIDDSL().uuid;

    return input;
  }
}
