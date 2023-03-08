import { isCompatible, SourceFieldType, TargetFieldType } from './compatible';
import { createBaseType, createReferenceType } from '@/modules/domain/domain-design/dsl/factory';
import { DataObjectTypeName } from '../../data-design/dsl/dsl';

test('isCompatible', () => {
  const intSource: SourceFieldType = createBaseType('Integer');
  const intTarget: TargetFieldType = { type: DataObjectTypeName.Integer };
  const stringTarget: TargetFieldType = { type: DataObjectTypeName.String };
  const refSource: SourceFieldType = createReferenceType('ref', 'string');

  expect(isCompatible(intSource, intTarget, { getReferenceStorageType: () => undefined })).toBeTruthy();
  expect(isCompatible(intSource, stringTarget, { getReferenceStorageType: () => undefined })).toBeFalsy();
  expect(isCompatible(refSource, stringTarget, { getReferenceStorageType: () => undefined })).toBeFalsy();
  expect(
    isCompatible(refSource, stringTarget, { getReferenceStorageType: () => createBaseType('String') })
  ).toBeTruthy();
});
