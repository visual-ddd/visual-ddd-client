import { NoopArray } from '@wakeapp/utils';
import { EnumDSL } from '../dsl';
import { DomainObjectUnderAggregation } from './DomainObjectUnderAggregation';

export class DomainObjectEnum extends DomainObjectUnderAggregation<EnumDSL> {
  objectTypeTitle: string = '枚举';

  /**
   * 可以引用
   */
  referable: boolean = true;

  /**
   * 没有外部依赖
   */
  dependencies = NoopArray;
  associations = NoopArray;
  aggregations = NoopArray;
  compositions = NoopArray;
}
