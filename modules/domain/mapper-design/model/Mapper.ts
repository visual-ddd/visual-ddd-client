import { BaseNode } from '@/lib/editor';
import { NoopArray } from '@wakeapp/utils';
import { computed, makeObservable } from 'mobx';
import { MapperObjectDSL } from '../dsl';
import { IFieldMapper } from './IFieldMapper';
import { MapperStore } from './MapperStore';

export class Mapper {
  private node: BaseNode;
  private mapperStore: MapperStore;

  get id() {
    return this.node.id;
  }

  /**
   * dsl 数据
   */
  get dsl() {
    return this.node.properties as unknown as MapperObjectDSL;
  }

  /**
   * 来源对象
   */
  @computed
  get sourceObject() {
    if (this.dsl.source == null) {
      return undefined;
    }
    return this.mapperStore.getSourceObjectById(this.dsl.source.referenceId);
  }

  /**
   * 目标对象
   */
  @computed
  get targetObject() {
    if (this.dsl.target == null) {
      return undefined;
    }
    return this.mapperStore.getTargetObjectById(this.dsl.target.referenceId);
  }

  /**
   * 映射字段
   */
  @computed
  get mappers(): IFieldMapper[] {
    if (this.targetObject == null || this.sourceObject == null) {
      return NoopArray;
    }

    return this.dsl.mappers.map(i => {
      return {
        ...i,
        sourceProperty: i.source
          ? this.sourceObject?.properties.find(j => j.uuid === i.source!.referenceId)
          : undefined,
        targetProperty: i.target
          ? this.targetObject?.properties.find(j => j.uuid === i.target!.referenceId)
          : undefined,
      };
    });
  }

  constructor(inject: { mapperStore: MapperStore; node: BaseNode }) {
    this.mapperStore = inject.mapperStore;
    this.node = inject.node;

    makeObservable(this);
  }
}
