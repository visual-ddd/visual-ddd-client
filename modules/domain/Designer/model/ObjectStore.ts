import { derive } from '@/lib/store';
import { makeObservable } from 'mobx';
import { delay } from '@wakeapp/utils';

import { DataObjectEditorModel } from '../../data-design';
import { DomainEditorModel } from '../../domain-design';
import { IObjectStore, ISourceObject, ITargetObject } from '../../mapper-design';

import { DomainDesignerTabs } from './constants';
import { DomainDesignerModel } from './DomainDesignerModel';

/**
 * 统一对象存储
 */
export class ObjectStore implements IObjectStore {
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
        key: 'domain',
        label: '领域对象',
        list: this.entities.concat(this.valueObjects),
      },
      {
        key: 'struct',
        label: '结构对象',
        list: this.dtos,
      },
    ];
  }

  @derive
  get targetObjectGroup() {
    return [
      {
        key: 'data',
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
