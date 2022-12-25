import { derive } from '@/lib/store';
import { NoopArray } from '@wakeapp/utils';
import { makeObservable } from 'mobx';
import { CommandDSL } from '../dsl';
import { DomainObject, DomainObjectInject } from './DomainObject';

/**
 * 命令对象
 */
export class DomainObjectCommand extends DomainObject<CommandDSL> {
  // 命令不能作为类型引用
  referable: boolean = false;

  @derive
  get readableTitle() {
    return `命令 - ${this.title}(${this.name})`;
  }

  /**
   * TODO: 可以引用规则
   */
  @derive
  get dependencies() {
    return NoopArray;
  }

  constructor(inject: DomainObjectInject) {
    super(inject);

    makeObservable(this);
  }
}
