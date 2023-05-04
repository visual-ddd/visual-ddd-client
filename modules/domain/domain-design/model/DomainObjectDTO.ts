import { derive } from '@/lib/store';
import { booleanPredicate, NoopArray } from '@wakeapp/utils';

import { DTODSL, extraDependenciesFromClass, NameDSL } from '../dsl';

import { DomainObject } from './DomainObject';
import { DomainObjectFactory } from './DomainObjectFactory';
import { toTypescriptInteface } from './toTypescriptInterface';

/**
 * DTO 声明
 */
export class DomainObjectDTO extends DomainObject<DTODSL> {
  objectTypeTitle: string = 'DTO';

  /**
   * DTO 是顶级的没有父级
   */
  package = undefined;

  /**
   * 可以引用
   */
  referable: boolean = true;

  /**
   * 全局 DTO
   */
  @derive
  get objectsInSameScope(): DomainObjectDTO[] {
    return this.store.referableObjects.filter(
      (i): i is DomainObjectDTO => DomainObjectFactory.isDTO(i) && i.id !== this.id
    );
  }

  /**
   * 依赖当前节点的对象
   */
  @derive
  get objectsDependentOnMe() {
    const list: DomainObject<NameDSL>[] = [];

    // 非可引用对象也可以引用
    for (const obj of this.store.objectsInArray) {
      if (obj.dependencies.some(dep => dep.id === this.id)) {
        list.push(obj);
        continue;
      }

      if (obj.associations.some(dep => dep.id === this.id)) {
        list.push(obj);
      }
    }

    return list;
  }

  @derive({ requiresReaction: true })
  get rawDependencies() {
    return extraDependenciesFromClass(this.dsl);
  }

  /**
   * 依赖
   */
  @derive
  get dependencies() {
    return Array.from(this.rawDependencies.dependency)
      .map(i => {
        return this.store.getObjectById(i);
      })
      .filter(booleanPredicate);
  }

  /**
   * 关联
   */
  @derive
  get associations() {
    return Array.from(this.rawDependencies.association)
      .map(i => {
        return this.store.getObjectById(i);
      })
      .filter(booleanPredicate);
  }

  aggregations = NoopArray;
  compositions = NoopArray;

  /**
   * 当关联的数据长度不匹配时存在引用错误
   */
  @derive
  get hasReferencesError() {
    return (
      this.rawDependencies.dependency.size !== this.dependencies.length ||
      this.rawDependencies.association.size !== this.associations.length
    );
  }

  override toTypescript(objectsInclued?: Set<DomainObject<any>>): string {
    return toTypescriptInteface(
      this,
      this.dsl.properties,
      id => {
        return this.store.getObjectById(id);
      },
      objectsInclued
    );
  }
}
