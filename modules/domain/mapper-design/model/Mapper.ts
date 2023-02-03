import { BaseNode } from '@/lib/editor';
import { NoopArray } from '@wakeapp/utils';
import { computed, makeObservable } from 'mobx';
import { UntitledInCamelCase } from '../../domain-design/dsl/constants';

import { isCompatible, MapperObjectDSL } from '../dsl';
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

  @computed
  get sourceFields() {
    return this.sourceObject?.properties ?? NoopArray;
  }

  @computed
  get targetFields() {
    return this.targetObject?.properties ?? NoopArray;
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
        sourceProperty: i.source ? this.sourceObject?.properties.find(j => j.uuid === i.source) : undefined,
        targetProperty: i.target ? this.targetObject?.properties.find(j => j.uuid === i.target) : undefined,
      };
    });
  }

  @computed
  get readableTitle() {
    const dsl = this.dsl;
    return dsl.title ? `${dsl.title}(${dsl.name})` : `${dsl.name || UntitledInCamelCase}`;
  }

  constructor(inject: { mapperStore: MapperStore; node: BaseNode }) {
    this.mapperStore = inject.mapperStore;
    this.node = inject.node;

    makeObservable(this);
  }

  getSourceObjectById(id: string) {
    return this.mapperStore.getSourceObjectById(id);
  }

  getSourceFieldById(id?: string) {
    if (id == null) {
      return;
    }

    return this.sourceFields.find(i => i.uuid === id);
  }

  getTargetFieldById(id?: string) {
    if (id == null) {
      return;
    }

    return this.targetFields.find(i => i.uuid === id);
  }

  focusObject(id: string) {
    this.mapperStore.focusObject(id);
  }

  /**
   * 获取兼容来源字段的目标字段列表
   * @param sourceId
   */
  getCompatibleTargetField(sourceId?: string) {
    const sourceField = this.getSourceFieldById(sourceId);
    const targetFields = this.targetFields;

    if (sourceField == null || sourceField.type == null) {
      return NoopArray;
    }

    return targetFields.filter(i => isCompatible(sourceField.type!, i.type));
  }
}
