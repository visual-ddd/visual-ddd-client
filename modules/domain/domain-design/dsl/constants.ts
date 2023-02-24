import { RelationShipDSL } from './dsl';

export { NameTooltip, NameTooltipSimple } from '@/lib/core';

/**
 * Java 中 Void, 用于注解空 (null) 的值
 */
export const VoidClass = 'Void';

/**
 * Java 中 void 关键字
 */
export const Void = 'void';

export const UntitledInCamelCase = 'untitled';
export const UntitledInUpperCamelCase = 'Untitled';
export const UntitledInUpperCase = 'UNTITLED';
export const UntitledInHumanReadable = '未命名';

export const RelativeShipMap = {
  [RelationShipDSL.Aggregation]: '聚合',
  [RelationShipDSL.Association]: '关联',
  [RelationShipDSL.Composition]: '组合',
  [RelationShipDSL.Dependency]: '依赖',
};

export const RelationShipList = [
  { label: RelativeShipMap[RelationShipDSL.Aggregation], value: RelationShipDSL.Aggregation },
  { label: RelativeShipMap[RelationShipDSL.Association], value: RelationShipDSL.Association },
  { label: RelativeShipMap[RelationShipDSL.Composition], value: RelationShipDSL.Composition },
  { label: RelativeShipMap[RelationShipDSL.Dependency], value: RelationShipDSL.Dependency },
];

export const AccessModifier = {
  public: '',
  private: '-',
  protected: '#',
};

export const AccessList = [
  { label: 'public(公开)', value: 'public' },
  { label: 'private(私有)', value: 'private' },
  { label: 'protected(保护)', value: 'protected' },
];

/**
 * 领域对象名称
 */
export enum DomainObjectName {
  Aggregation = 'aggregation',
  Entity = 'entity',
  ValueObject = 'value-object',
  Command = 'command',
  Rule = 'rule',
  Enum = 'enum',
  Query = 'query',
  DTO = 'dto',
}

export const DomainObjectColors = {
  [DomainObjectName.Aggregation]: '#D9F7BE',
  [DomainObjectName.Entity]: '#b1ed7c',
  [DomainObjectName.ValueObject]: '#70cafa',
  [DomainObjectName.Command]: '#f7f73d',
  [DomainObjectName.Rule]: '#303133',
  [DomainObjectName.Enum]: '#CDAEF2',
  [DomainObjectName.Query]: '#C2F3EC',
  [DomainObjectName.DTO]: '#d5d5d5',
};
