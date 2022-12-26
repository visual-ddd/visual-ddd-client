import { derive } from '@/lib/store';
import { NoopArray } from '@wakeapp/utils';
import { makeObservable } from 'mobx';

import { NameDSL, ReferenceDSL, RuleDSL } from '../dsl';

import { DomainObject, DomainObjectInject } from './DomainObject';

/**
 * 规则对象
 */
export class DomainObjectRule extends DomainObject<RuleDSL> {
  // 规则不能作为类型引用
  referable: boolean = false;

  @derive
  get readableTitle() {
    return `规则 - ${this.title}(${this.name})`;
  }

  /**
   * 所属的对象
   */
  @derive
  get association() {
    return this.dsl.association && this.container.getObjectById(this.dsl.association.referenceId);
  }

  /**
   * 没有依赖
   */
  dependencies = NoopArray;
  associations = NoopArray;
  aggregations = NoopArray;
  compositions = NoopArray;

  constructor(inject: DomainObjectInject) {
    super(inject);

    makeObservable(this);
  }

  /**
   * 设置所属聚合
   * @param params
   */
  setAssociation(params: { association: DomainObject<NameDSL> | undefined }) {
    const { association } = params;
    if (association && association === this.association) {
      return;
    }

    const formModel = this.editorModel.formStore.getFormModel(this.id);
    if (formModel) {
      formModel.setProperty(
        'association',
        association
          ? ({
              referenceId: association.id,
              name: `${association.title}(${association.name})`,
            } satisfies ReferenceDSL)
          : undefined
      );
    }
  }
}
