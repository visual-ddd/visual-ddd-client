import { derive } from '@/lib/store';
import { reaction } from 'mobx';

import { EntityDSL } from '../dsl';

import { DomainObjectInject } from './DomainObject';
import { DomainObjectClass } from './DomainObjectClass';

export class DomainObjectEntity extends DomainObjectClass<EntityDSL> {
  /**
   * 是否为聚合根
   */
  @derive
  get isAggregationRoot() {
    return !!this.dsl.isAggregationRoot;
  }

  @derive
  override get objectTypeTitle() {
    return this.isAggregationRoot ? '聚合根' : '实体';
  }

  constructor(inject: DomainObjectInject) {
    super(inject);

    // 监听聚合根变化，需要触发聚合检查
    this.disposer.push(
      reaction(
        () => this.dsl.isAggregationRoot,
        () => {
          this.store.emitAggregationChanged({
            node: this.node,
            object: this,
            current: this.package,
          });
        },
        { name: 'WATCH_AGGREGATION_ROOT_CHANGE' }
      )
    );
  }
}
