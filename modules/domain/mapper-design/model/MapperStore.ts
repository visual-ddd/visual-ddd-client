import { BaseEditorCommandHandler, BaseEditorEvent } from '@/lib/editor';
import { derive, makeAutoBindThis } from '@/lib/store';
import { tryDispose } from '@/lib/utils';
import { debounce } from '@wakeapp/utils';
import { makeObservable, observable, runInAction } from 'mobx';
import { MapperObjectName } from '../dsl';

import { ISourceObject, ISourceObjectGroup } from './ISourceObject';
import { ITargetObject, ITargetObjectGroup } from './ITargetObject';
import { Mapper } from './Mapper';

export interface IObjectStore {
  /**
   * 来源对象列表
   */
  sourceObjectGroups: ISourceObjectGroup[];

  /**
   * 目标对象列表
   */
  targetObjectGroup: ITargetObjectGroup[];

  /**
   * 获取来源对象
   * @param id
   */
  getSourceObjectById(id: string): ISourceObject | undefined;

  /**
   * 获取目标对象
   * @param id
   */
  getTargetObjectById(id: string): ITargetObject | undefined;

  /**
   * 聚焦节点
   * @param id
   */
  focusObject(id: string): void;

  /**
   * 获取节点的类型
   * @param id
   */
  getObjectType(id: string): { type: string; label: string } | undefined;
}

export class MapperStore {
  protected event: BaseEditorEvent;
  protected objectStore: IObjectStore;

  @observable.shallow
  protected mappers: Map<string, Mapper> = new Map();

  /**
   * 即将移除的映射
   */
  @observable.shallow
  protected mappersWillRemoved: Map<string, Mapper> = new Map();

  /**
   * 映射列表
   */
  @derive
  get mappersInArray() {
    return Array.from(this.mappers.values());
  }

  get sourceObjectGroups() {
    return this.objectStore.sourceObjectGroups;
  }

  get targetObjectGroup() {
    return this.objectStore.targetObjectGroup;
  }

  /**
   * 获取来源对象
   * @param id
   */
  getSourceObjectById(id: string): ISourceObject | undefined {
    return this.objectStore.getSourceObjectById(id);
  }

  /**
   * 获取目标对象
   * @param id
   */
  getTargetObjectById(id: string): ITargetObject | undefined {
    return this.objectStore.getTargetObjectById(id);
  }

  /**
   * 聚焦对象
   * @param id
   */
  focusObject(id: string): void {
    this.objectStore.focusObject(id);
  }

  /**
   * 对象类型
   * @param id
   * @returns
   */
  getObjectType(id: string) {
    return this.objectStore.getObjectType(id);
  }

  /**
   * 获取映射对象
   * @param id
   * @returns
   */
  getMapperById(id?: string) {
    if (id == null) {
      return undefined;
    }

    return this.mappers.get(id) || this.mappersWillRemoved.get(id);
  }

  constructor(inject: { event: BaseEditorEvent; objectStore: IObjectStore; commandHandler: BaseEditorCommandHandler }) {
    const { event, objectStore, commandHandler } = inject;
    this.event = event;
    this.objectStore = objectStore;

    this.event.on('NODE_CREATED', ({ node }) => {
      if (node.name !== MapperObjectName.MapperObject) {
        return;
      }

      const object = new Mapper({ mapperStore: this, node, commandHandler });
      this.mappers.set(object.id, object);
    });

    this.event.on('NODE_REMOVED', ({ node }) => {
      const old = this.mappers.get(node.id);
      if (old) {
        const willRemove = this.mappersWillRemoved.get(old.id);
        this.mappersWillRemoved.set(old.id, old);
        this.mappers.delete(node.id);

        if (willRemove) {
          tryDispose(willRemove);
        }

        this.gc();
      }
    });

    makeObservable(this);
    makeAutoBindThis(this);
  }

  private gc = debounce(() => {
    runInAction(() => {
      this.mappersWillRemoved.forEach(i => tryDispose(i));
      this.mappersWillRemoved.clear();
    });
  }, 100);
}
