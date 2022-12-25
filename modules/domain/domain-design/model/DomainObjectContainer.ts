import { BaseEditorEvent } from '@/lib/editor';
import { derive } from '@/lib/store';
import { makeObservable, observable } from 'mobx';

import { NameDSL } from '../dsl';
import { DomainObject } from './DomainObject';
import { DomainObjectAggregation } from './DomainObjectAggregation';
import { DomainObjectFactory } from './DomainObjectFactory';
import { IDomainObjectContainer } from './IDomainContainer';

export interface EdgeDeclaration {
  id: string;
  source: string;
  target: string;

  /**
   * 对象关系
   * https://www.cnblogs.com/zhongj/p/11169780.html
   *
   * dependency 依赖关系，严格意义上还有关联(Association), 这里暂时没有实现
   * aggregation 聚合
   * composition 组合(统一生命周期的整体和部分的关系)
   */
  type: 'dependency' | 'aggregation' | 'composition';
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
   * 命令
   */
  @derive
  get commands() {
    return this.objectsInArray.filter(i => DomainObjectFactory.isCommand(i));
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
      if (DomainObjectFactory.isCommand(item)) {
        if (!this.isAggregationAssociateCommand(item)) {
          result.push(item);
        }
      }

      // TODO: 规则
    }

    return result;
  }

  /**
   * 根据依赖关系计算的边
   */
  @derive
  get dependencyEdgesFromReferableObjects(): EdgeDeclaration[] {
    const list = this.referableObjects;
    return list
      .map(i => {
        return i.dependenciesWithoutSelf.map(j => {
          return {
            id: `${i.id}->${j.id}`,
            source: i.id,
            target: j.id,
            type: 'dependency',
          } satisfies EdgeDeclaration;
        });
      })
      .flat();
  }

  /**
   * 计算聚合和命令之间的管理关系
   */
  @derive
  get dependencyEdgesFromAggregations(): EdgeDeclaration[] {
    return this.aggregations
      .map(i =>
        (i as DomainObjectAggregation).dependenciesFromCommands.map(d => {
          return {
            id: `${i.id}->${d.id}`,
            source: i.id,
            target: d.id,
            type: 'aggregation',
          } satisfies EdgeDeclaration;
        })
      )
      .flat();
  }

  /**
   * 根据依赖关系计算的边
   */
  @derive
  get dependencyEdges(): EdgeDeclaration[] {
    return this.dependencyEdgesFromReferableObjects.concat(this.dependencyEdgesFromAggregations);
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

  isAggregationAssociateCommand(command: DomainObject<NameDSL> | string) {
    return this.aggregations.some(i => (i as DomainObjectAggregation).hasCommand(command));
  }
}
