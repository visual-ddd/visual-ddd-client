import * as mockedUuid from 'uuid';
import { DomainObjectName } from '../domain-design/dsl/constants';
import {
  createBaseType,
  createContainerType,
  createEntity,
  createEnum,
  createProperty,
  createReferenceType,
  createValueObject,
} from '../domain-design/dsl/factory';
import { FromAggregationRootDSLGenerator } from './FromAggregationRootDSLGenerator';

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

describe('FromAggregationRootDSLGenerator', () => {
  beforeEach(() => {
    mockedUuidModule.reset();
  });

  it('should throw error, if entity is not aggregation root', () => {
    const entity = createEntity();
    entity.isAggregationRoot = false;

    expect(() => {
      new FromAggregationRootDSLGenerator({
        entity,
        domainObjectStore: {
          getObjectById() {
            return undefined;
          },
        },
      });
    }).toThrowError();
  });

  it('generate', () => {
    const entity = createEntity();
    entity.name = 'MyEntity';
    entity.title = '我的实体';
    entity.description = '我的实体描述';
    entity.isAggregationRoot = true;

    entity.properties = [];

    // 基础类型
    const baseTypeProperty = createProperty();
    baseTypeProperty.type = createBaseType('String');
    baseTypeProperty.name = 'baseTypeProperty';
    baseTypeProperty.title = '基础类型属性';
    baseTypeProperty.description = '基础类型属性的描述';

    const baseType2Property = createProperty();
    baseType2Property.type = createBaseType('Long');
    baseType2Property.name = 'baseType2Property';
    baseType2Property.title = '基础类型属性2';
    baseType2Property.description = '基础类型属性的描述2';

    // 容器类型
    const containerTypeProperty = createProperty();
    containerTypeProperty.type = createContainerType('List');
    containerTypeProperty.type.params.item = createBaseType('Boolean');
    containerTypeProperty.name = 'containerTypeProperty';

    // 引用类型 enum
    const referenceTypePropertyForEnum = createProperty();
    referenceTypePropertyForEnum.type = createReferenceType(DomainObjectName.Enum, 'enumName');
    referenceTypePropertyForEnum.name = 'referenceTypePropertyForEnum';

    // 引用类型 valueObject
    const referenceTypePropertyForValueObject = createProperty();
    referenceTypePropertyForValueObject.type = createReferenceType(DomainObjectName.ValueObject, 'valueObjectName');
    referenceTypePropertyForValueObject.name = 'referenceTypePropertyForValueObject';

    // 引用类型 entity
    const referenceTypePropertyForEntity = createProperty();
    referenceTypePropertyForEntity.type = createReferenceType(DomainObjectName.Entity, 'entityName');
    referenceTypePropertyForEntity.name = 'referenceTypePropertyForEntity';

    entity.properties.push(
      baseTypeProperty,
      baseType2Property,
      containerTypeProperty,
      referenceTypePropertyForEnum,
      referenceTypePropertyForValueObject,
      referenceTypePropertyForEntity
    );

    entity.id = baseTypeProperty.uuid;

    const gen = new FromAggregationRootDSLGenerator({
      entity,
      domainObjectStore: {
        getObjectById(id) {
          switch (id) {
            case DomainObjectName.Enum: {
              const obj = createEnum();
              obj.name = 'enumName';
              obj.title = '枚举';
              obj.description = '枚举描述';

              return {
                type: DomainObjectName.Enum,
                value: obj,
              };
            }
            case DomainObjectName.ValueObject: {
              const obj = createValueObject();
              obj.name = 'valueObjectName';
              obj.title = '值对象';
              obj.description = '值对象描述';

              return {
                type: DomainObjectName.ValueObject,
                value: obj,
              };
            }
            case DomainObjectName.Entity: {
              const obj = createEntity();
              obj.name = 'entityName';
              obj.title = '实体';
              obj.description = '实体描述';

              return {
                type: DomainObjectName.Entity,
                value: obj,
              };
            }
          }
        },
      },
    });

    const result = gen.generate();

    expect(result).toMatchSnapshot();
  });
});
