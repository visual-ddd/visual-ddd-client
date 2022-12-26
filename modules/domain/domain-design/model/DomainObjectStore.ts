import { BaseEditorEvent, BaseEditorModel } from '@/lib/editor';
import { derive } from '@/lib/store';
import { booleanPredicate } from '@wakeapp/utils';
import { makeObservable, observable } from 'mobx';

import { NameDSL } from '../dsl';
import { DomainObject } from './DomainObject';
import { DomainObjectFactory } from './DomainObjectFactory';
import { IDomainObjectContainer } from './IDomainContainer';
import { IEdgeDeclaration } from './IEdgeDeclaration';

/**
 * 描述和计算对象之间的依赖关系
 */
export class DomainObjectStore implements IDomainObjectContainer {
  private event: BaseEditorEvent;
  private editorModel: BaseEditorModel;

  /**
   * 所有对象
   */
  @observable
  objects: Map<string, DomainObject<NameDSL>> = new Map();

  /**
   * 对象数组
   */
  @derive
  get objectsInArray() {
    return Array.from(this.objects.values());
  }

  /**
   * 可引用类型(实体、值对象、命令)
   * 需要验证是否引用其他聚合的对象
   */
  @derive
  get referableObjects() {
    return this.objectsInArray.filter(i => i.referable);
  }

  /**
   * 不可引用的类型(规则、聚合)
   */
  @derive
  get unreferableObjects() {
    return this.objectsInArray.filter(i => !i.referable);
  }

  /**
   * 聚合
   */
  @derive
  get aggregations() {
    console.log('getting aggregations');

    return this.unreferableObjects.filter(DomainObjectFactory.isAggregation);
  }

  /**
   * 命令
   */
  @derive
  get commands() {
    return this.referableObjects.filter(DomainObjectFactory.isCommand);
  }

  /**
   * 规则列表
   */
  @derive
  get rules() {
    return this.unreferableObjects.filter(DomainObjectFactory.isRule);
  }

  /**
   * 未关联聚合的领域对象(实体、值对象、命令、规则)
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
        if (!item.aggregation) {
          result.push(item);
        }
      }

      if (DomainObjectFactory.isRule(item)) {
        if (!item.association) {
          result.push(item);
        }
      }
    }

    return result;
  }

  /**
   * 根据依赖关系计算的边
   */
  @derive
  get edges(): IEdgeDeclaration[] {
    return this.objectsInArray
      .map(i => {
        return i.edges;
      })
      .flat();
  }

  constructor(inject: { event: BaseEditorEvent; editorModel: BaseEditorModel }) {
    this.event = inject.event;
    this.editorModel = inject.editorModel;

    this.event.on('NODE_CREATED', ({ node }) => {
      const object = DomainObjectFactory.getDomainObject({ node, container: this, editorModel: this.editorModel });
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

  toObjects<T extends DomainObject<NameDSL> = DomainObject<NameDSL>>(ids: string[]): T[] {
    return ids.map(i => this.getObjectById(i)).filter(booleanPredicate) as T[];
  }
}
