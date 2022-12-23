import { NoopObject } from '@wakeapp/utils';
import { v4 } from 'uuid';
import { UntitledInCamelCase, UntitledInHumanReadable, UntitledInUpperCamelCase } from './constants';
import {
  BaseType,
  ClassDSL,
  ContainerType,
  EntityDSL,
  MethodDSL,
  NameCase,
  NameDSL,
  ParameterDSL,
  PropertyDSL,
  TypeDSL,
  TypeType,
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
    meta: {},
  };
}

export function createProperty(): PropertyDSL {
  return {
    ...createNameDSL({ wordCase: 'camelCase' }),
    type: createBaseType('String'),
    access: 'public',
    description: '注释',
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
  return {
    ...createClass(),
    isAggregationRoot: false,
    id: 'untitled',
  };
}
