import { NoopObject } from '@wakeapp/utils';
import { v4 } from 'uuid';
import { UntitledInCamelCase, UntitledInTitle, UntitledInUpperCamelCase } from './constants';
import { ClassDSL, EntityDSL, MethodDSL, NameDSL, ParameterDSL, PropertyDSL } from './dsl';

export function createNameDSL(
  options: { wordCase?: 'CamelCase' | 'camelCase'; title?: boolean } = NoopObject
): NameDSL {
  const { wordCase = 'CamelCase', title } = options;
  return {
    uuid: v4(),
    name: wordCase === 'CamelCase' ? UntitledInUpperCamelCase : UntitledInCamelCase,
    title: title ? UntitledInTitle : '',
    description: '',
    meta: {},
  };
}

export function createProperty(): PropertyDSL {
  return {
    ...createNameDSL({ wordCase: 'camelCase' }),
    type: 'String',
    access: 'public',
    description: '注释',
  };
}

export function createParameter(): ParameterDSL {
  return {
    ...createNameDSL({}),
    name: 'arg',
    type: 'String',
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
