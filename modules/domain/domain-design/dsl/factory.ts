import { NoopObject } from '@wakeapp/utils';
import { v4 } from 'uuid';
import { UntitledInCamelCase, UntitledInHumanReadable, UntitledInUpperCamelCase } from './constants';
import {
  AggregationDSL,
  BaseType,
  ClassDSL,
  CommandDSL,
  ContainerType,
  EntityDSL,
  MethodDSL,
  NameCase,
  NameDSL,
  ParameterDSL,
  PropertyDSL,
  RuleDSL,
  SourceDSL,
  TypeDSL,
  TypeType,
  ValueObjectDSL,
} from './dsl';

export function createBaseType(type: BaseType): TypeDSL {
  return { type: TypeType.Base, name: type };
}

export function createVoidClass() {
  return createBaseType('Void');
}

export function createContainerType(container: ContainerType): TypeDSL {
  return {
    type: TypeType.Container,
    name: container,
    params: container === 'Map' ? { key: createVoidClass(), value: createVoidClass() } : { item: createVoidClass() },
  };
}

export function createReferenceType(id: string, name: string): TypeDSL {
  return {
    type: TypeType.Reference,
    referenceId: id,
    name,
  };
}

export function createNameDSL(options: { wordCase?: NameCase; title?: boolean } = NoopObject): NameDSL {
  const { wordCase = 'CamelCase', title } = options;
  return {
    uuid: v4(),
    name: wordCase === 'CamelCase' ? UntitledInUpperCamelCase : UntitledInCamelCase,
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
  return {
    ...cls,
    isAggregationRoot: false,
    id: cls.properties[0].uuid,
  };
}

export function createValueObject(): ValueObjectDSL {
  const cls = createClass();

  // 默认不包含方法
  cls.methods = [];

  return cls;
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
    aggregation: undefined,
    result: undefined,
  };
}

export function createRule(): RuleDSL {
  return { ...createNameDSL({ wordCase: 'CamelCase', title: true }), description: '规则描述', association: undefined };
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
