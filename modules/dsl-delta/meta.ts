import {
  ObjectMeta,
  ValueType,
  NameDSL,
  ApplicationDSL,
  WithVersion,
  NormalizedBusinessDomainDSL,
  AggregateDSL,
  EntityDSL,
  ValueObjectDSL,
  EnumDSL,
  CommandDSL,
  ClassDSL,
  PropertyDSL,
  MethodDSL,
  MethodDefineDSL,
  ParameterDSL,
  EnumMemberDSL,
  DomainEvent,
  RuleDSL,
} from './protocol';

export const NAME_DSL_META: ObjectMeta<NameDSL> = {
  uuid: ValueType.Atom,
  name: ValueType.Atom,
  title: ValueType.Atom,
  description: ValueType.Atom,
  meta: ValueType.Atom,
  __delta: ValueType.Never,
};

export const WITH_VERSION_DSL_META: ObjectMeta<WithVersion> = {
  version: ValueType.Never,
};

const PROPERTY_DSL_META: ObjectMeta<PropertyDSL> = {
  ...NAME_DSL_META,
  type: ValueType.Atom,
  access: ValueType.Atom,
  optional: ValueType.Atom,
};

/**
 * 方法参数 DSL
 */
const PARAMETER_DSL_META: ObjectMeta<ParameterDSL> = {
  ...NAME_DSL_META,
  type: ValueType.Atom,
  optional: ValueType.Atom,
};

/**
 * 方法定义 DSL
 */
const METHOD_DEFINE_DSL_META: ObjectMeta<MethodDefineDSL> = {
  uuid: ValueType.Atom,
  parameters: [PARAMETER_DSL_META],
  return: ValueType.Atom,
};

const METHOD_DSL_META: ObjectMeta<MethodDSL> = {
  ...NAME_DSL_META,
  access: ValueType.Atom,
  signature: METHOD_DEFINE_DSL_META,
  // TODO: 不包含 abstract
};

const CLASS_DSL_META: ObjectMeta<ClassDSL> = {
  ...NAME_DSL_META,
  // TODO: 暂时不包含继承、抽象类、类方法、属性等信息
  properties: [PROPERTY_DSL_META],
  methods: [METHOD_DSL_META],
};

const ENTITY_DSL_META: ObjectMeta<EntityDSL> = {
  ...CLASS_DSL_META,
  id: PROPERTY_DSL_META,
};

const VALUE_OBJECT_META: ObjectMeta<ValueObjectDSL> = {
  ...CLASS_DSL_META,
};

const ENUM_MEMBER_META: ObjectMeta<EnumMemberDSL> = {
  ...NAME_DSL_META,
  code: ValueType.Atom,
};

const ENUMS_DSL_META: ObjectMeta<EnumDSL> = {
  ...NAME_DSL_META,
  baseType: ValueType.Atom,
  members: [ENUM_MEMBER_META],
};

const EVENT_DSL_META: ObjectMeta<DomainEvent> = {
  ...NAME_DSL_META,
  properties: [PROPERTY_DSL_META],
};

const RULE_DSL_META: ObjectMeta<RuleDSL> = {
  ...NAME_DSL_META,
};

const COMMAND_DSL_META: ObjectMeta<CommandDSL> = {
  ...NAME_DSL_META,
  source: ValueType.Atom,
  repository: ValueType.Atom,
  properties: [PROPERTY_DSL_META],
  category: ValueType.Atom,
  event: EVENT_DSL_META,
  eventSendable: ValueType.Atom,
  rules: [RULE_DSL_META],
  return: ValueType.Atom,
};

/**
 * 聚合 DSL
 */
const AGGREGATE_DSL_META: ObjectMeta<AggregateDSL> = {
  ...NAME_DSL_META,
  root: ENTITY_DSL_META,
  entities: [ENTITY_DSL_META],
  valueObjects: [VALUE_OBJECT_META],
  enums: [ENUMS_DSL_META],
  commands: [COMMAND_DSL_META],
};

/**
 * 业务场景 DSL meta
 */
const BUSINESS_DOMAIN_DSL_META: ObjectMeta<NormalizedBusinessDomainDSL> = {
  ...NAME_DSL_META,
  ...WITH_VERSION_DSL_META,
  domainModel: {
    aggregates: [AGGREGATE_DSL_META],
  },

  // TODO: 暂时跳过
  queryModel: ValueType.Never,
  dataModel: ValueType.Never,
  objectMapper: ValueType.Never,
};

/**
 * 应用 DSL meta
 */
export const APPLICATION_DSL_META: ObjectMeta<ApplicationDSL> = {
  ...NAME_DSL_META,
  ...WITH_VERSION_DSL_META,
  /**
   * 领域模型
   */
  businessDomains: [BUSINESS_DOMAIN_DSL_META],

  // TODO: 暂时跳过
  businessScenarios: ValueType.Never,
};
