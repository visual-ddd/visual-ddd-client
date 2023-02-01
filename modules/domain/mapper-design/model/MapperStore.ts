import { BaseEditorEvent } from '@/lib/editor';
import { derive, makeAutoBindThis } from '@/lib/store';
import { makeObservable, observable } from 'mobx';
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
}

export class MapperStore {
  protected event: BaseEditorEvent;
  protected objectStore: IObjectStore;

  @observable.shallow
  protected mappers: Map<string, Mapper> = new Map();

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
   * 获取映射对象
   * @param id
   * @returns
   */
  getMapperById(id: string) {
    return this.mappers.get(id);
  }

  constructor(inject: { event: BaseEditorEvent; objectStore: IObjectStore }) {
    const { event, objectStore } = inject;
    this.event = event;
    this.objectStore = objectStore;

    this.event.on('NODE_CREATED', ({ node }) => {
      if (node.name !== MapperObjectName.MapperObject) {
        return;
      }

      const object = new Mapper({ mapperStore: this, node });
      this.mappers.set(object.id, object);
    });

    this.event.on('NODE_REMOVED', ({ node }) => {
      this.mappers.delete(node.id);
    });

    makeObservable(this);
    makeAutoBindThis(this);
  }
}
