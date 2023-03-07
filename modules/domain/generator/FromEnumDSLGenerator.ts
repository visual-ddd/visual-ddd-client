import { EnumDSL, TypeDSL, TypeType } from '../domain-design/dsl/dsl';

export class FromEnumDSLGenerator {
  private enum: EnumDSL;

  constructor(inject: { enum: EnumDSL }) {
    this.enum = inject.enum;
  }

  toTypeDSL(): TypeDSL {
    switch (this.enum.baseType) {
      case 'string':
        return {
          type: TypeType.Base,
          name: 'String',
        };
      case 'number':
        return {
          type: TypeType.Base,
          name: 'Integer',
        };
    }
  }
}
