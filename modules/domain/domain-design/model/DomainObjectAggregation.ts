import { derive } from '@/lib/store';
import { booleanPredicate } from '@wakeapp/utils';
import { makeObservable } from 'mobx';
import { AggregationDSL } from '../dsl';
import { DomainObject, DomainObjectInject } from './DomainObject';

/**
 * 聚合对象
 */
export class DomainObjectAggregation extends DomainObject<AggregationDSL> {
  referable: boolean = false;

  @derive
  get readableTitle() {
    return `聚合 - ${this.title}(${this.name})`;
  }

  /**
   * 依赖，从 children 中计算即可
   * TODO: 命令
   */
  @derive
  get dependencies() {
    console.log('getting dependencies');
    return this.node.children
      .map(i => {
        return this.container.getObjectById(i.id);
      })
      .filter(booleanPredicate);
  }

  constructor(inject: DomainObjectInject) {
    super(inject);

    makeObservable(this);
  }
}
