import { derive } from '@/lib/store';
import { booleanPredicate, NoopArray } from '@wakeapp/utils';
import { makeObservable } from 'mobx';
import { CommandDSL, extraDependenciesFromCommand, ReferenceDSL } from '../dsl';
import { DomainObject, DomainObjectInject } from './DomainObject';
import { DomainObjectAggregation } from './DomainObjectAggregation';
import { DomainObjectRule } from './DomainObjectRule';
import { IDomainObjectUnderAggregation } from './DomainObjectUnderAggregation';

/**
 * 命令对象
 */
export class DomainObjectCommand extends DomainObject<CommandDSL> implements IDomainObjectUnderAggregation {
  objectTypeTitle = '命令';

  /**
   * 可以作为对象应用，通常作为实体、值对象的方法参数类型
   */
  referable: boolean = true;

  /**
   * 当前所属的聚合
   */
  @derive
  get aggregation(): DomainObjectAggregation | undefined {
    return (
      this.dsl.aggregation &&
      (this.container.getObjectById(this.dsl.aggregation.referenceId) as DomainObjectAggregation)
    );
  }

  /**
   * 当前命令聚合的规则
   */
  @derive
  get rules(): DomainObjectRule[] {
    return this.container.rules.filter(i => i.association === this);
  }

  /**
   * 原始提取的依赖
   */
  @derive
  get rawDependencies() {
    return extraDependenciesFromCommand(this.dsl);
  }

  /**
   * 关联。命令可以关联领域内部的实体、值对象
   */
  @derive
  get associations() {
    return this.rawDependencies.map(i => this.container.getObjectById(i)).filter(booleanPredicate);
  }

  /**
   * 命令可以聚合规则
   */
  @derive
  get aggregations() {
    return this.rules;
  }

  /**
   * 命令无依赖
   */
  dependencies = NoopArray;
  compositions = NoopArray;

  constructor(inject: DomainObjectInject) {
    super(inject);

    makeObservable(this);
  }

  /**
   * 设置所属聚合
   * @param params
   */
  setAggregation(params: { aggregation: DomainObjectAggregation | undefined }) {
    const { aggregation } = params;
    if (aggregation && aggregation === this.aggregation) {
      return;
    }

    const formModel = this.editorModel.formStore.getFormModel(this.id);
    if (formModel) {
      formModel.setProperty(
        'aggregation',
        aggregation
          ? ({
              referenceId: aggregation.id,
              name: `${aggregation.title}(${aggregation.name})`,
            } satisfies ReferenceDSL)
          : undefined
      );
    }
  }
}
