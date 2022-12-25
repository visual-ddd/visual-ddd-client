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

  @derive
  get commands() {
    return this.dsl.commands;
  }

  @derive
  get dependenciesFromChildren() {
    console.log('getting dependencies');
    return this.node.children
      .map(i => {
        return this.container.getObjectById(i.id);
      })
      .filter(booleanPredicate);
  }

  @derive
  get dependenciesFromCommands() {
    console.log('getting commands');
    return this.commands
      .map(i => {
        return this.container.getObjectById(i.referenceId);
      })
      .filter(booleanPredicate);
  }

  /**
   * 依赖，从 children 中计算即可
   * TODO: 命令
   */
  @derive
  get dependencies() {
    return this.dependenciesFromChildren.concat(this.dependenciesFromCommands);
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
    return this.commands.some(i => i.referenceId === id);
  }
}
