import { NoopArray } from '@wakeapp/utils';
import { generateEnum } from '@/lib/typescript';
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

  hasReferencesError: boolean = false;

  override toTypescript(): string {
    return generateEnum({
      comment: {
        title: this.title,
        description: this.description,
      },
      name: this.name,
      member: this.dsl.members.map(i => ({
        name: i.name,
        code: i.code && this.dsl.baseType === 'string' ? i.code : Number(i.code),
        comment: {
          title: i.title,
          description: i.description,
        },
      })),
    });
  }
}
