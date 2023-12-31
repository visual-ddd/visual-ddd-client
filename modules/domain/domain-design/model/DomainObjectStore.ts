import { BaseEditorEvent, BaseEditorModel, BaseNode } from '@/lib/editor';
import { command, derive, makeAutoBindThis } from '@/lib/store';
import { tryDispose } from '@/lib/utils';
import { booleanPredicate, debounce } from '@wakeapp/utils';
import { makeObservable, observable, runInAction } from 'mobx';

import { NameDSL } from '../dsl';
import { DomainObject } from './DomainObject';
import { DomainObjectEvent } from './DomainObjectEvent';
import { DomainObjectFactory } from './DomainObjectFactory';
import { DomainValidateManager } from './DomainValidateManager';
import { IEdgeDeclaration } from './IEdgeDeclaration';

/**
 * 描述和计算对象之间的依赖关系
 */
export class DomainObjectStore {
  protected domainObjectEvent: DomainObjectEvent;
  protected event: BaseEditorEvent;
  protected editorModel: BaseEditorModel;
  protected validateManager: DomainValidateManager;

  /**
   * 所有对象
   */
  @observable.shallow
  protected objects: Map<string, DomainObject<NameDSL>> = new Map();

  /**
   * 即将移除的对象
   */
  @observable.shallow
  protected objectsWillRemoved: Map<string, DomainObject<NameDSL>> = new Map();

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
   * 所有实体
   */
  @derive
  get entities() {
    return this.referableObjects.filter(DomainObjectFactory.isEntity);
  }

  /**
   * 所有值对象
   */
  @derive
  get valueObjects() {
    return this.referableObjects.filter(DomainObjectFactory.isValueObject);
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
   * 查询
   */
  @derive
  get queries() {
    return this.unreferableObjects.filter(DomainObjectFactory.isQuery);
  }

  /**
   * DTO
   */
  @derive
  get dtos() {
    return this.referableObjects.filter(DomainObjectFactory.isDTO);
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
      if (DomainObjectFactory.isUnderAggregation(item)) {
        if (!item.aggregation) {
          result.push(item);
        }
      }

      // 规则
      if (DomainObjectFactory.isRule(item)) {
        if (!item.aggregator) {
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
    this.domainObjectEvent = new DomainObjectEvent();
    this.event = inject.event;
    this.editorModel = inject.editorModel;

    this.event.on('NODE_CREATED', ({ node }) => {
      const object = DomainObjectFactory.getDomainObject({ node, store: this, editorModel: this.editorModel });
      if (object) {
        const current = this.objects.get(object.id);
        if (current) {
          tryDispose(current);
        }

        this.objects.set(object.id, object);
      }
    });

    this.event.on('NODE_REMOVED', ({ node }) => {
      const obj = this.objects.get(node.id);

      // 延迟删除, 方便其他地方计算依赖关系
      if (obj) {
        const willRemove = this.objectsWillRemoved.get(obj.id);
        this.objectsWillRemoved.set(obj.id, obj);
        this.objects.delete(obj.id);

        if (willRemove) {
          tryDispose(willRemove);
        }

        this.gc();
      }
    });

    this.validateManager = new DomainValidateManager({
      event: this.event,
      editorModel: this.editorModel,
      store: this,
      domainObjectEvent: this.domainObjectEvent,
    });

    makeObservable(this);
    makeAutoBindThis(this);
  }

  /**
   * 获取指定类型的对象
   * @param type
   * @returns
   */
  getObjectsInType(type: typeof DomainObject) {
    return this.objectsInArray.filter(i => i instanceof type);
  }

  /**
   * 通过 UUID 获取对象实例
   * @param id
   * @returns
   */
  getObjectById(id?: string): DomainObject<NameDSL> | undefined {
    if (id == null) {
      return undefined;
    }

    return this.objects.get(id) || this.objectsWillRemoved.get(id);
  }

  /**
   * 将 ids 转换为对象
   * @param ids
   * @returns
   */
  toObjects<T extends DomainObject<NameDSL> = DomainObject<NameDSL>>(ids: string[]): T[] {
    return ids.map(i => this.getObjectById(i)).filter(booleanPredicate) as T[];
  }

  /**
   * 聚合关系变动
   * @param params
   */
  @command('OBJECT_STORE:BEFORE_AGGREGATION_CHANGE')
  emitAggregationBeforeChange(params: {
    node: BaseNode;
    object: DomainObject<NameDSL>;
    current?: DomainObject<NameDSL>;
  }) {
    this.domainObjectEvent.emit('OBJECT_BEFORE_AGGREGATION_CHANGE', params);
  }

  /**
   * 聚合关系变动
   * @param params
   */
  @command('OBJECT_STORE:AGGREGATION_CHANGE')
  emitAggregationChanged(params: {
    node: BaseNode;
    object: DomainObject<NameDSL>;
    previous?: DomainObject<NameDSL>;
    current?: DomainObject<NameDSL>;
  }) {
    this.domainObjectEvent.emit('OBJECT_AGGREGATION_CHANGED', params);
  }

  @command('OBJECT_STORE:NAME_CHANGED')
  emitNameChanged(params: { node: BaseNode; object: DomainObject<NameDSL> }) {
    this.domainObjectEvent.emit('OBJECT_NAME_CHANGED', params);
  }

  private gc = debounce(() => {
    runInAction(() => {
      this.objectsWillRemoved.forEach(i => tryDispose(i));
      this.objectsWillRemoved.clear();
    });
  });
}
