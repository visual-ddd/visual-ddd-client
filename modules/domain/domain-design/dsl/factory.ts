import { NoopObject } from '@wakeapp/utils';
import { v4 } from 'uuid';
import {
  UntitledInCamelCase,
  UntitledInHumanReadable,
  UntitledInUpperCamelCase,
  UntitledInUpperCase,
} from './constants';
import {
  AggregationDSL,
  BaseType,
  BaseTypeDSL,
  ClassDSL,
  CommandDSL,
  ContainerType,
  ContainerTypeDSL,
  DTODSL,
  EntityDSL,
  EnumBaseType,
  EnumDSL,
  IDDSL,
  MethodDSL,
  NameCase,
  NameDSL,
  ParameterDSL,
  PropertyDSL,
  QueryDSL,
  ReferenceTypeDSL,
  RuleDSL,
  SourceDSL,
  TypeType,
  ValueObjectDSL,
} from './dsl';

export function createBaseType(type: BaseType): BaseTypeDSL {
  return { type: TypeType.Base, name: type };
}

export function createVoidClass() {
  return createBaseType('Void');
}

export function createContainerType(container: ContainerType): ContainerTypeDSL {
  return {
    type: TypeType.Container,
    name: container,
    params: container === 'Map' ? { key: createVoidClass(), value: createVoidClass() } : { item: createVoidClass() },
  };
}

export function createReferenceType(id: string, name: string): ReferenceTypeDSL {
  return {
    type: TypeType.Reference,
    referenceId: id,
    name,
  };
}

export function createIDDSL(): IDDSL {
  return {
    uuid: v4(),
  };
}

export function createNameDSL(options: { wordCase?: NameCase; title?: boolean } = NoopObject): NameDSL {
  const { wordCase = 'CamelCase', title } = options;
  return {
    ...createIDDSL(),
    name:
      wordCase === 'CamelCase'
        ? UntitledInUpperCamelCase
        : wordCase === 'SNAKE_CASE'
        ? UntitledInUpperCase
        : UntitledInCamelCase,
    title: title ? UntitledInHumanReadable : '',
    description: '',
    meta: [],
  };
}

export function createProperty(): PropertyDSL {
  return {
    ...createNameDSL({ wordCase: 'camelCase' }),
    type: createBaseType('String'),
    title: UntitledInHumanReadable,
    access: 'public',
    description: '',
  };
}

export function createParameter(): ParameterDSL {
  return {
    ...createNameDSL({}),
    name: 'arg',
    type: createBaseType('String'),
  };
}

export function createMethod(): MethodDSL {
  return {
    ...createNameDSL({ wordCase: 'camelCase' }),
    access: 'public',
    abstract: false,
    parameters: [],
    result: undefined,
  };
}

export function createClass(): ClassDSL {
  return {
    ...createNameDSL({ wordCase: 'CamelCase', title: true }),
    extends: undefined,
    implements: [],
    abstract: false,
    properties: [createProperty()],
    methods: [createMethod()],
    classProperties: [],
    classMethods: [],
  };
}

export function createEntity(): EntityDSL {
  const cls = createClass();
  const idProperty = { ...createProperty(), type: createBaseType('Long'), name: 'id', title: '实体唯一标识符' };

  return {
    ...cls,
    properties: [idProperty, ...cls.properties],
    isAggregationRoot: false,
    id: idProperty.uuid,
  };
}

export function createValueObject(): ValueObjectDSL {
  const cls = createClass();

  // 默认不包含方法
  cls.methods = [];

  return cls;
}

export function createEnumMember(type: EnumBaseType) {
  return {
    ...createNameDSL({ wordCase: 'SNAKE_CASE' }),
    code: type === 'string' ? UntitledInUpperCase : '0',
  };
}

/**
 * 构造枚举
 * @returns
 */
export function createEnum(): EnumDSL {
  return {
    ...createNameDSL({ wordCase: 'CamelCase', title: true }),
    baseType: 'number',
    members: [createEnumMember('number')],
  };
}

/**
 * 转换枚举为基础类型
 * @param e
 * @returns
 */
export function enumToTypeDSL(e: EnumDSL) {
  return createBaseType(e.baseType === 'number' ? 'Integer' : 'String');
}

export function createSourceDSL(): SourceDSL {
  return {
    http: { enabled: true },
    rpc: { enabled: true },
    event: { enabled: false, value: '' },
    schedule: { enabled: false, value: '' },
  };
}

/**
 * 构造命令
 */
export function createCommand(): CommandDSL {
  return {
    ...createNameDSL({ wordCase: 'CamelCase', title: true }),
    source: createSourceDSL(),
    properties: [createProperty()],
    eventProperties: [],
    repository: 'modify',
    eventSendable: false,
    aggregation: undefined,
    result: undefined,
  };
}

export function createRule(): RuleDSL {
  return { ...createNameDSL({ wordCase: 'CamelCase', title: true }), description: '规则描述', aggregator: undefined };
}

/**
 * 查询
 * @returns
 */
export function createQuery(): QueryDSL {
  return {
    ...createNameDSL({ wordCase: 'CamelCase', title: true }),
    source: createSourceDSL(),
    properties: [createProperty()],
    result: undefined,
    pagination: false,
  };
}

/**
 * 构造聚合
 * @returns
 */
export function createAggregation(): AggregationDSL {
  return {
    ...createNameDSL({ wordCase: 'CamelCase', title: true }),
    color: '#D9F7BE',
  };
}

/**
 * DTO 创建
 * @returns
 */
export function createDTO(): DTODSL {
  return { ...createClass(), methods: [] };
}
