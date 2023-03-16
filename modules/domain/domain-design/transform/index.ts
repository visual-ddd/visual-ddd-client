import { CommandDSL, DTODSL, EntityDSL, NameDSL, QueryDSL, ValueObjectDSL } from '../dsl/dsl';
import { DomainObjectName } from '../dsl/constants';

import { Command } from './Command';
import { Query } from './Query';
import { DTO } from './DTO';
import { Entity } from './Entity';
import { ValueObject } from './ValueObject';
import { IDomainObjectTransform } from './Transform';

export type { IDomainObjectTransform } from './Transform';

/**
 * 创建领域对象转换器
 * @param type
 * @param value
 */
export function createDomainObjectTransform(type: DomainObjectName.Command, value: CommandDSL): IDomainObjectTransform;
export function createDomainObjectTransform(type: DomainObjectName.Query, value: QueryDSL): IDomainObjectTransform;
export function createDomainObjectTransform(type: DomainObjectName.DTO, value: DTODSL): IDomainObjectTransform;
export function createDomainObjectTransform(type: DomainObjectName.Entity, value: EntityDSL): IDomainObjectTransform;
export function createDomainObjectTransform(
  type: DomainObjectName.ValueObject,
  value: ValueObjectDSL
): IDomainObjectTransform;
export function createDomainObjectTransform(type: DomainObjectName, value: NameDSL): IDomainObjectTransform {
  switch (type) {
    case DomainObjectName.Command:
      return new Command(value as CommandDSL);
    case DomainObjectName.Query:
      return new Query(value as QueryDSL);
    case DomainObjectName.DTO:
      return new DTO(value as DTODSL);
    case DomainObjectName.Entity:
      return new Entity(value as EntityDSL);
    case DomainObjectName.ValueObject:
      return new ValueObject(value as ValueObjectDSL);
    default:
      throw new Error(`不支持的领域对象类型: ${type}`);
  }
}

export const TRANSFORM_TARGET: [DomainObjectName, keyof IDomainObjectTransform][] = [
  [DomainObjectName.Command, 'toCommand'],
  [DomainObjectName.Query, 'toQuery'],
  [DomainObjectName.DTO, 'toDTO'],
  [DomainObjectName.Entity, 'toEntity'],
  [DomainObjectName.ValueObject, 'toValueObject'],
];
