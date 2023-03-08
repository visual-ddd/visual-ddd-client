import { derive } from '@/lib/store';
import { makeObservable } from 'mobx';
import { delay } from '@wakeapp/utils';

import { DataObjectEditorModel } from '../../data-design';
import { DomainEditorModel } from '../../domain-design';
import { DomainObjectName } from '../../domain-design/dsl/constants';
import { enumToTypeDSL } from '../../domain-design/dsl/factory';
import { IObjectStore, ISourceObject, ITargetObject } from '../../mapper-design';
import { ObjectReferenceSource } from '../../mapper-design/dsl/dsl';
import { DomainObjectDefinition, IDomainObjectStore } from '../../generator';

import { DomainDesignerTabs } from './constants';
import { DomainDesignerModel } from './DomainDesignerModel';

/**
 * 统一对象存储
 */
export class ObjectStore implements IObjectStore, IDomainObjectStore {
  protected domainDesignerModel: DomainDesignerModel;
  protected domainEditorModel: DomainEditorModel;
  protected dataObjectEditorModel: DataObjectEditorModel;
  protected queryEditorModel: DomainEditorModel;

  /**
   * 可引用实体列表
   * 过滤掉没有关联聚合实体
   */
  @derive
  protected get entities() {
    return this.domainEditorModel.domainObjectStore.entities
      .filter(i => {
        return !!i.aggregation;
      })
      .map(i => i.dsl) as ISourceObject[];
  }

  /**
   * 可引用值对象列表
   * 过滤掉没有关联聚合实体
   */
  @derive
  protected get valueObjects() {
    return this.domainEditorModel.domainObjectStore.valueObjects
      .filter(i => {
        return !!i.aggregation;
      })
      .map(i => i.dsl) as ISourceObject[];
  }

  @derive
  protected get dtos() {
    return this.queryEditorModel.domainObjectStore.dtos.map(i => i.dsl) as ISourceObject[];
  }

  @derive
  protected get dataObjects() {
    return this.dataObjectEditorModel.dataObjectStore.objectsInArray.map(i => i.dsl) as ITargetObject[];
  }

  @derive
  get sourceObjectGroups() {
    return [
      {
        key: ObjectReferenceSource.Domain,
        label: '领域对象',
        list: this.entities.concat(this.valueObjects),
      },
      {
        key: ObjectReferenceSource.Struct,
        label: '结构对象',
        list: this.dtos,
      },
    ];
  }

  @derive
  get targetObjectGroup() {
    return [
      {
        key: ObjectReferenceSource.Data,
        label: '数据对象',
        list: this.dataObjects,
      },
    ];
  }

  constructor(inject: {
    domainEditorModel: DomainEditorModel;
    dataObjectEditorModel: DataObjectEditorModel;
    queryEditorModel: DomainEditorModel;
    domainDesignerModel: DomainDesignerModel;
  }) {
    const { domainDesignerModel, domainEditorModel, dataObjectEditorModel, queryEditorModel } = inject;

    this.domainDesignerModel = domainDesignerModel;
    this.domainEditorModel = domainEditorModel;
    this.queryEditorModel = queryEditorModel;
    this.dataObjectEditorModel = dataObjectEditorModel;

    makeObservable(this);
  }

  getObjectById: IDomainObjectStore['getObjectById'] = id => {
    const object = this.domainEditorModel.domainObjectStore.getObjectById(id);

    if (object == null) {
      return;
    }

    return {
      type: object.shapeName,
      value: object.dsl,
    } as DomainObjectDefinition;
  };

  getReferenceStorageType: IObjectStore['getReferenceStorageType'] = id => {
    // 目前仅支持枚举类型有底层村塾类型
    const object = this.getObjectById(id);

    if (object?.type === DomainObjectName.Enum) {
      return enumToTypeDSL(object.value);
    }
  };

  getSourceObjectById(id: string): ISourceObject | undefined {
    // 查询对象
    let object = this.queryEditorModel.domainObjectStore.getObjectById(id);

    if (object != null) {
      return object.dsl as ISourceObject;
    }

    // 领域对象，需要关联聚合
    object = this.domainEditorModel.domainObjectStore.getObjectById(id);

    if (object != null && object.package != null) {
      return object.dsl as ISourceObject;
    }
  }

  getTargetObjectById(id: string): ITargetObject | undefined {
    return this.dataObjectEditorModel.dataObjectStore.getObjectById(id)?.dsl as ITargetObject;
  }

  getObjectType(id: string): { type: string; label: string } | undefined {
    // 查询对象
    let object: any = this.queryEditorModel.domainObjectStore.getObjectById(id);

    if (object != null) {
      return { type: 'query', label: '查询' };
    }

    // 领域对象，需要关联聚合
    object = this.domainEditorModel.domainObjectStore.getObjectById(id);

    if (object != null) {
      return { type: 'domain', label: '领域' };
    }

    object = this.dataObjectEditorModel.dataObjectStore.getObjectById(id);
    if (object != null) {
      return { type: 'data', label: '数据' };
    }
  }

  async focusObject(id: string) {
    // 先尝试领域模型
    const domainObject = this.domainEditorModel.domainObjectStore.getObjectById(id);
    if (domainObject) {
      this.domainDesignerModel.setActiveTab({ tab: DomainDesignerTabs.DomainModel });
      await delay(100);
      this.domainEditorModel.commandHandler.focusNode({ node: domainObject.node });
      return;
    }

    // 查询模型
    const queryObject = this.queryEditorModel.domainObjectStore.getObjectById(id);
    if (queryObject) {
      this.domainDesignerModel.setActiveTab({ tab: DomainDesignerTabs.QueryModel });
      await delay(100);
      this.queryEditorModel.commandHandler.focusNode({ node: queryObject.node });
      return;
    }

    // 数据模型
    const dataObject = this.dataObjectEditorModel.dataObjectStore.getObjectById(id);
    if (dataObject) {
      this.domainDesignerModel.setActiveTab({ tab: DomainDesignerTabs.DataModel });
      await delay(100);
      this.dataObjectEditorModel.commandHandler.focusNode({ node: dataObject.node });
      return;
    }
  }
}
