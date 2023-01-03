import { derive } from '@/lib/store';
import { booleanPredicate, NoopArray } from '@wakeapp/utils';
import { makeObservable } from 'mobx';
import { AggregationDSL, NameDSL } from '../dsl';
import { DomainObject, DomainObjectInject } from './DomainObject';
import { DomainObjectCommand } from './DomainObjectCommand';
import { DomainObjectFactory } from './DomainObjectFactory';

/**
 * 聚合对象
 */
export class DomainObjectAggregation extends DomainObject<AggregationDSL> {
  referable: boolean = false;

  objectTypeTitle = '聚合';

  @derive
  get color() {
    return this.dsl.color;
  }

  /**
   * 聚合是顶级的，没有父级
   */
  package = undefined;

  /**
   * 所有顶级聚合
   */
  @derive
  get objectsInSameScope(): DomainObjectAggregation[] {
    const parent = this.node.parent;
    if (!parent) {
      return NoopArray;
    }

    return parent.children
      .map(i => this.store.getObjectById(i.id))
      .filter((i): i is DomainObjectAggregation => !!i && DomainObjectFactory.isAggregation(i) && i.id !== this.id);
  }

  objectsDependentOnMe = NoopArray;

  /**
   * 当前聚合包含的命令
   */
  @derive
  get commands(): DomainObjectCommand[] {
    console.log('getting commands');
    return this.store.commands.filter(i => {
      return i.aggregation === this;
    });
  }

  /**
   * 组合
   */
  @derive
  get aggregations() {
    return this.commands;
  }

  /**
   * 组合。聚合下的实体、值对象都是组合关系，生命周期一致
   */
  @derive
  get compositions() {
    console.log('getting dependencies');
    return this.node.children
      .map(i => {
        return this.store.getObjectById(i.id);
      })
      .filter(booleanPredicate);
  }

  dependencies = [];
  associations = [];

  /**
   * 聚合根
   */
  @derive
  get aggregationRoots() {
    return this.compositions.filter(DomainObjectFactory.isAggregationRoot);
  }

  constructor(inject: DomainObjectInject) {
    super(inject);

    makeObservable(this);
  }

  /**
   * 是否包含命令
   * @param command
   * @returns
   */
  hasCommand(command: DomainObject<NameDSL> | string) {
    const id = typeof command === 'string' ? command : command.id;

    return this.commands.some(i => i.id === id);
  }
}
