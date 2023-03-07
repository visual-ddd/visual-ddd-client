import { TypeType } from '../domain-design/dsl/dsl';
import { createEnum } from '../domain-design/dsl/factory';
import { FromEnumDSLGenerator } from './FromEnumDSLGenerator';

describe('FromEnumDSLGenerator', () => {
  it('toTypeDSL', () => {
    const enumDSL = createEnum();
    const stringEnum = createEnum();
    stringEnum.baseType = 'string';

    const generator1 = new FromEnumDSLGenerator({ enum: enumDSL });
    expect(generator1.toTypeDSL()).toEqual({
      type: TypeType.Base,
      name: 'Integer',
    });

    const generator2 = new FromEnumDSLGenerator({ enum: stringEnum });
    expect(generator2.toTypeDSL()).toEqual({
      type: TypeType.Base,
      name: 'String',
    });
  });
});
