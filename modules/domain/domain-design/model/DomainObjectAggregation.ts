import { derive } from '@/lib/store';
import { booleanPredicate } from '@wakeapp/utils';
import { makeObservable } from 'mobx';
import { AggregationDSL, NameDSL } from '../dsl';
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
   * 当前聚合包含的命令
   */
  @derive
  get commands() {
    console.log('getting commands');
    return this.container.commands.filter(i => {
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
        return this.container.getObjectById(i.id);
      })
      .filter(booleanPredicate);
  }

  dependencies = [];
  associations = [];

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
