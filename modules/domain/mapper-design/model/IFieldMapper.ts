import { PropertyDSL } from '@/modules/domain/domain-design/dsl';
import { DataObjectPropertyDSL } from '@/modules/domain/data-design/dsl';

import { FieldMapperDSL } from '../dsl';

export interface IFieldMapper extends FieldMapperDSL {
  sourceProperty?: PropertyDSL;
  targetProperty?: DataObjectPropertyDSL;
}
