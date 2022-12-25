import { BaseEditorEvent } from '@/lib/editor';
import { derive } from '@/lib/store';
import { makeObservable, observable } from 'mobx';

import { NameDSL } from '../dsl';
import { DomainObject } from './DomainObject';
import { DomainObjectFactory } from './DomainObjectFactory';
import { IDomainObjectContainer } from './IDomainContainer';

export interface EdgeDeclaration {
  id: string;
  source: string;
  target: string;
}

/**
 * 描述和计算对象之间的依赖关系
 */
export class DomainObjectContainer implements IDomainObjectContainer {
  private event: BaseEditorEvent;

  /**
   * 所有对象
   */
  @observable
  objects: Map<string, DomainObject<NameDSL>> = new Map();

  @derive
  get objectsInArray() {
    return Array.from(this.objects.values());
  }

  /**
   * 可引用类型(实体、值对象)
   * 需要验证是否引用其他聚合的对象
   */
  @derive
  get referableObjects() {
    return this.objectsInArray.filter(i => i.referable);
  }

  /**
   * 聚合
   */
  @derive
  get aggregations() {
    console.log('getting aggregations');

    return this.objectsInArray.filter(i => DomainObjectFactory.isAggregation(i));
  }

  /**
   * 未关联聚合的领域对象(实体、值对象、命令)
   */
  @derive
  get uncontrolledDomainObjects() {
    const list = this.objectsInArray;
    const result: DomainObject<NameDSL>[] = [];

    for (const item of list) {
      // 排除掉聚合
      if (DomainObjectFactory.isAggregation(item)) {
        continue;
      }

      // 值对象或实体, 如果没有放在聚合容器内，说明是未关联
      if (DomainObjectFactory.isEntity(item) || DomainObjectFactory.isValueObject(item)) {
        if (!item.hasParent) {
          result.push(item);
        }
      }

      // 命令
      // TODO:
    }

    return result;
  }

  /**
   * 根据依赖关系计算的边
   */
  @derive
  get dependencyEdges(): EdgeDeclaration[] {
    const list = this.referableObjects;
    return list
      .map(i => {
        return i.dependenciesWithoutSelf.map(j => {
          return {
            id: `${i.id}->${j.id}`,
            source: i.id,
            target: j.id,
          };
        });
      })
      .flat();
  }

  constructor(inject: { event: BaseEditorEvent }) {
    this.event = inject.event;

    this.event.on('NODE_CREATED', ({ node }) => {
      const object = DomainObjectFactory.getDomainObject({ node, container: this });
      if (object) {
        this.objects.set(object.id, object);
      }
    });
    this.event.on('NODE_REMOVED', ({ node }) => {
      this.objects.delete(node.id);
    });

    makeObservable(this);
  }

  /**
   * 通过 UUID 获取对象实例
   * @param id
   * @returns
   */
  getObjectById(id: string): DomainObject<NameDSL> | undefined {
    return this.objects.get(id);
  }
}
