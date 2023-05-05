import { BaseType, RelationShipDSL } from './dsl';

export {
  NameTooltip,
  NameTooltipSimple,
  UntitledInCamelCase,
  UntitledInHumanReadable,
  UntitledInUpperCamelCase,
  UntitledInUpperCase,
} from '@/lib/core';

/**
 * Java 中 Void, 用于注解空 (null) 的值
 */
export const VoidClass = 'Void';

/**
 * Java 中 void 关键字
 */
export const Void = 'void';

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

export const BaseTypeToTypescriptTypeMap: Record<BaseType, string> = {
  String: 'string',
  Integer: 'number',
  Long: 'number',
  Double: 'number',
  Float: 'number',
  Date: 'Date',
  Boolean: 'boolean',
  BigDecimal: 'number',
  Char: 'string',
  Byte: 'number',
  Short: 'number',
  Void: 'void',
};

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

export const DomainObjectReadableName: Record<DomainObjectName, string> = {
  [DomainObjectName.Aggregation]: '聚合',
  [DomainObjectName.Entity]: '实体',
  [DomainObjectName.ValueObject]: '值对象',
  [DomainObjectName.Command]: '命令',
  [DomainObjectName.Rule]: '规则',
  [DomainObjectName.Enum]: '枚举',
  [DomainObjectName.Query]: '查询',
  [DomainObjectName.DTO]: '数据传输对象',
};

export const DomainObjectColors = {
  [DomainObjectName.Aggregation]: '#D9F7BE',
  [DomainObjectName.Entity]: '#d9f7be',
  [DomainObjectName.ValueObject]: '#bae7ff',
  [DomainObjectName.Command]: '#ffffb8',
  [DomainObjectName.Rule]: '#eaeaea',
  [DomainObjectName.Enum]: '#CDAEF2',
  [DomainObjectName.Query]: '#C2F3EC',
  [DomainObjectName.DTO]: '#d5d5d5',
};
