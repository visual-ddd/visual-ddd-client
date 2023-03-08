import { DataObjectTypeName } from '../../data-design/dsl';
import { createBaseType } from '../../domain-design/dsl/factory';
import { TypeType } from '../../domain-design/dsl/dsl';

import { autoMapper } from './auto-mapper';
import { ISourceObject } from './ISourceObject';
import { ITargetObject } from './ITargetObject';

test('autoMapper', () => {
  expect(
    autoMapper(
      {
        properties: [
          { uuid: 'foo', name: 'foo', type: { type: TypeType.Base, name: 'Char' } },
          { uuid: 'bar', name: 'bar', type: { type: TypeType.Base, name: 'String' } },
          { uuid: 'enum', name: 'enum', type: { type: TypeType.Reference, name: 'enum' } },
        ],
      } as ISourceObject,
      {
        properties: [
          { uuid: 'd-foo', name: 'foooo', type: { type: DataObjectTypeName.Integer } },
          { uuid: 'd-bar', name: 'baz', type: { type: DataObjectTypeName.LongText } },
          { uuid: 'd-baz', name: 'barrr', type: { type: DataObjectTypeName.Integer } },
          { uuid: 'd-enum', name: 'enumm', type: { type: DataObjectTypeName.String } },
        ],
      } as ITargetObject,
      { getReferenceStorageType: () => createBaseType('String') }
    )
  ).toEqual({ foo: 'd-foo', bar: 'd-bar', enum: 'd-enum' });
});
