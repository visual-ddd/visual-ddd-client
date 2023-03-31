import { derive } from '@/lib/store';
import { booleanPredicate, NoopArray } from '@wakeapp/utils';
import { intercept, makeObservable, reaction } from 'mobx';
import { CommandDSL, extraDependenciesFromCommand, NameDSL, ReferenceDSL } from '../dsl';
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
   * 命令需要关联聚合
   */
  @derive
  get package() {
    return this.aggregation;
  }

  /**
   * 命令的分类
   */
  @derive
  get category() {
    return this.dsl.category;
  }

  /**
   * 同一作用域下下的命令
   */
  @derive
  get objectsInSameScope() {
    return this.aggregation?.commands.filter(i => i.id !== this.id) || NoopArray;
  }

  @derive
  get objectsDependentOnMe(): DomainObject<NameDSL>[] {
    const list: DomainObject<NameDSL>[] = [];

    for (const obj of this.store.referableObjects) {
      // 命令只能被依赖，不能使用关联
      if (obj.dependencies.some(dep => dep.id === this.id)) {
        list.push(obj);
      }
    }

    return list;
  }

  /**
   * 当前所属的聚合
   */
  @derive
  get aggregation(): DomainObjectAggregation | undefined {
    return (
      this.dsl.aggregation && (this.store.getObjectById(this.dsl.aggregation.referenceId) as DomainObjectAggregation)
    );
  }

  /**
   * 当前命令聚合的规则
   */
  @derive
  get rules(): DomainObjectRule[] {
    return this.store.rules.filter(i => i.aggregator?.id === this.id);
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
    return this.rawDependencies.map(i => this.store.getObjectById(i)).filter(booleanPredicate);
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

  @derive
  get hasReferencesError() {
    return this.rawDependencies.length !== this.associations.length;
  }

  constructor(inject: DomainObjectInject) {
    super(inject);

    makeObservable(this);

    // 监听所属聚合变动
    this.disposer.push(
      intercept(this.dsl, 'aggregation', change => {
        this.store.emitAggregationBeforeChange({
          node: this.node,
          object: this,
          current: this.aggregation,
        });
        return change;
      }) as Function,
      reaction(
        () => this.dsl.aggregation,
        (value, prevValue) => {
          this.store.emitAggregationChanged({
            node: this.node,
            object: this,
            previous: this.store.getObjectById(prevValue?.referenceId),
            current: this.store.getObjectById(value?.referenceId),
          });
        },
        { name: 'WATCH_AGGREGATION_CHANGE' }
      )
    );
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
