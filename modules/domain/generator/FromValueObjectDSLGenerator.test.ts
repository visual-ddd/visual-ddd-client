import * as mockedUuid from 'uuid';
import { DTODSL } from '../domain-design/dsl/dsl';
import {
  createBaseType,
  createContainerType,
  createProperty,
  createReferenceType,
  createValueObject,
} from '../domain-design/dsl/factory';

import { BaseGeneratorState } from './BaseGeneratorState';
import { FromValueObjectDSLGenerator } from './FromValueObjectDSLGenerator';

jest.mock('uuid', () => {
  let count = 0;
  return {
    __esModule: true,
    reset() {
      count = 0;
    },
    v4() {
      return `uuid-${count++}`;
    },
  };
});

const mockedUuidModule = mockedUuid as unknown as jest.Mocked<{ reset(): void }>;

describe('FromValueObjectDSLGenerator', () => {
  beforeEach(() => {
    mockedUuidModule.reset();
  });

  it('toDTO baseInfo', () => {
    const valueObject = createValueObject();
    const state = new BaseGeneratorState<DTODSL>();

    const generator = new FromValueObjectDSLGenerator({
      valueObject,
      dtoGeneratorState: state,
      queryTypeDSLTransformer: {
        transformQueryTypeDSL(type) {
          return type;
        },
      },
    });

    const dto = generator.toDTO();

    expect(dto).toMatchObject({
      name: 'UntitledDTO',
      title: '未命名数据传输对象',
      description: '用于未命名的数据传输对象',
    });

    expect(generator.toDTOTypeDSL()).toEqual(createReferenceType(dto.uuid, dto.name));
    expect(state.list).toEqual([dto]);
  });

  it('toDTO properties', () => {
    const state = new BaseGeneratorState<DTODSL>();
    const valueObject = createValueObject();

    valueObject.properties = [];

    // 基础类型
    const baseTypeProperty = createProperty();
    baseTypeProperty.type = createBaseType('String');
    baseTypeProperty.name = 'baseTypeProperty';
    baseTypeProperty.title = '基础类型属性';
    baseTypeProperty.description = '基础类型属性的描述';

    // 容器类型
    const containerTypeProperty = createProperty();
    containerTypeProperty.type = createContainerType('List');
    containerTypeProperty.type.params.item = createBaseType('Boolean');
    containerTypeProperty.name = 'containerTypeProperty';

    // 引用类型 enum
    const referenceTypePropertyForEnum = createProperty();
    referenceTypePropertyForEnum.type = createReferenceType('enum', 'enumName');
    referenceTypePropertyForEnum.name = 'referenceTypePropertyForEnum';

    // 引用类型 valueObject
    const referenceTypePropertyForValueObject = createProperty();
    referenceTypePropertyForValueObject.type = createReferenceType('valueObject', 'valueObjectName');
    referenceTypePropertyForValueObject.name = 'referenceTypePropertyForValueObject';

    valueObject.properties.push(
      baseTypeProperty,
      containerTypeProperty,
      referenceTypePropertyForEnum,
      referenceTypePropertyForValueObject
    );

    const generator = new FromValueObjectDSLGenerator({
      valueObject,
      dtoGeneratorState: state,

      queryTypeDSLTransformer: {
        transformQueryTypeDSL(type) {
          return type;
        },
      },
    });

    const dto = generator.toDTO();

    expect(dto).toMatchSnapshot();
  });
});
