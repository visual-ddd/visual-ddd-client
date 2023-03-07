import { DomainObjectName } from '../domain-design/dsl/constants';
import { createBaseType, createContainerType, createEnum, createReferenceType } from '../domain-design/dsl/factory';
import { transformTypeDSLReference, transformTypeDSLToDataObjectTypeDSL } from './transform';

describe('transformTypeDSLReference', () => {
  it('transform baseType', () => {
    const stringType = createBaseType('String');
    const integerType = createBaseType('Integer');

    const result = transformTypeDSLReference(stringType, ref => ref);
    expect(result).toEqual(stringType);

    const result2 = transformTypeDSLReference(integerType, ref => ref);
    expect(result2).toEqual(integerType);
  });

  it('transform referenceType', () => {
    const ref = createReferenceType('id', 'name');

    const result = transformTypeDSLReference(ref, ref => ref);
    expect(result).toEqual(ref);
  });

  it('transform containerType', () => {
    const ref = createReferenceType('id', 'name');
    const base = createBaseType('String');
    const containerWithBaseType = createContainerType('List');
    containerWithBaseType.params.item = base;

    const containerWithRefType = createContainerType('List');
    containerWithRefType.params.item = ref;

    expect(transformTypeDSLReference(containerWithBaseType, ref => ref)).toEqual(containerWithBaseType);
    expect(transformTypeDSLReference(containerWithRefType, ref => ref)).toEqual(containerWithRefType);
  });
});

describe('transformTypeDSLToDataObjectTypeDSL', () => {
  it('transform baseType', () => {
    const stringType = createBaseType('String');
    const integerType = createBaseType('Integer');

    const result = transformTypeDSLToDataObjectTypeDSL(stringType, () => undefined);
    expect(result).toEqual({ type: 'String' });

    const result2 = transformTypeDSLToDataObjectTypeDSL(integerType, () => undefined);
    expect(result2).toEqual({ type: 'Integer' });
  });

  it('transform referenceType', () => {
    const ref = createReferenceType('id', 'name');

    const result = transformTypeDSLToDataObjectTypeDSL(ref, () => undefined);
    expect(result).toEqual(undefined);
  });

  it('transform enum', () => {
    const ref = createReferenceType('id', 'name');

    const result = transformTypeDSLToDataObjectTypeDSL(ref, () => ({
      type: DomainObjectName.Enum,
      value: createEnum(),
    }));

    expect(result).toEqual({ type: 'Integer' });
  });
});
