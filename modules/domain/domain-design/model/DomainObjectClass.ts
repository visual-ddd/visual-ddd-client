import { derive } from '@/lib/store';
import { booleanPredicate } from '@wakeapp/utils';
import { makeObservable } from 'mobx';
import { ClassDSL, extraDependenciesFromClass } from '../dsl';
import { DomainObject, DomainObjectInject } from './DomainObject';

/**
 * 实体
 */
export class DomainObjectClass<T extends ClassDSL = ClassDSL> extends DomainObject<T> {
  referable: boolean = true;

  @derive
  get readableTitle() {
    return `类 - ${this.title}(${this.name})`;
  }

  /**
   * 依赖 ID，计算比较昂贵
   */
  @derive({ requiresReaction: true })
  get dependenciesInId(): string[] {
    return extraDependenciesFromClass(this.dsl);
  }

  /**
   * 依赖
   */
  @derive
  get dependencies() {
    return this.dependenciesInId
      .map(i => {
        return this.container.getObjectById(i);
      })
      .filter(booleanPredicate);
  }

  constructor(inject: DomainObjectInject) {
    super(inject);

    makeObservable(this);
  }
}
