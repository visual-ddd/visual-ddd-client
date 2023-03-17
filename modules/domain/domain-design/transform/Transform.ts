import type { CommandDSL, DTODSL, EntityDSL, IDDSL, NameDSL, QueryDSL, ValueObjectDSL } from '../dsl/dsl';
import { createIDDSL } from '../dsl/factory';

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

  protected regenerateUUIDList(list?: IDDSL[]) {
    return list?.map(this.regenerateUUID);
  }

  protected regenerateUUID<T extends IDDSL = IDDSL>(input: T) {
    input.uuid = createIDDSL().uuid;

    return input;
  }
}
