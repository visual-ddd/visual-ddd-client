import { derive } from '@/lib/store';
import { NoopArray } from '@wakeapp/utils';
import { intercept, makeObservable, reaction } from 'mobx';

import { NameDSL, ReferenceDSL, RuleDSL } from '../dsl';

import { DomainObject, DomainObjectInject } from './DomainObject';

/**
 * 规则对象
 */
export class DomainObjectRule extends DomainObject<RuleDSL> {
  objectTypeTitle = '规则';

  // 规则不能作为类型引用
  referable: boolean = false;

  @derive
  get package() {
    return this.aggregator;
  }

  @derive
  get objectsInSameScope() {
    return this.aggregator?.aggregations.filter(i => i.id !== this.id) || NoopArray;
  }

  objectsDependentOnMe: DomainObject<NameDSL>[] = NoopArray;

  /**
   * 所属的对象
   */
  @derive
  get aggregator() {
    return this.dsl.aggregator && this.store.getObjectById(this.dsl.aggregator.referenceId);
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

    this.disposer.push(
      intercept(this.dsl, 'aggregator', change => {
        this.store.emitAggregationChanged({
          node: this.node,
          object: this,
          current: this.aggregator,
        });
        return change;
      }) as Function,
      reaction(
        () => this.dsl.aggregator,
        (value, prevValue) => {
          this.store.emitAggregationChanged({
            node: this.node,
            object: this,
            previous: this.store.getObjectById(prevValue?.referenceId),
            current: this.store.getObjectById(value?.referenceId),
          });
        },
        { name: 'WATCH_RULE_AGGREGATOR' }
      )
    );
  }

  /**
   * 设置所属聚合
   * @param params
   */
  setAggregator(params: { aggregator: DomainObject<NameDSL> | undefined }) {
    const { aggregator } = params;
    if (aggregator && aggregator === this.aggregator) {
      return;
    }

    const formModel = this.editorModel.formStore.getFormModel(this.id);
    if (formModel) {
      formModel.setProperty(
        'aggregator',
        aggregator
          ? ({
              referenceId: aggregator.id,
              name: `${aggregator.title}(${aggregator.name})`,
            } satisfies ReferenceDSL)
          : undefined
      );
    }
  }
}
