import { enumToTypeDSL } from '../domain-design/dsl';
import { EnumDSL, TypeDSL } from '../domain-design/dsl/dsl';

export class FromEnumDSLGenerator {
  private enum: EnumDSL;

  constructor(inject: { enum: EnumDSL }) {
    this.enum = inject.enum;
  }

  toTypeDSL(): TypeDSL {
    return enumToTypeDSL(this.enum);
  }
}
