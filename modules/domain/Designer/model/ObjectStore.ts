import { derive } from '@/lib/store';
import { makeObservable } from 'mobx';
import { DataObjectEditorModel } from '../../data-design';
import { DomainEditorModel } from '../../domain-design';
import { IObjectStore, ISourceObject, ITargetObject } from '../../mapper-design';

/**
 * 统一对象存储
 */
export class ObjectStore implements IObjectStore {
  protected domainEditorModel: DomainEditorModel;
  protected dataObjectEditorModel: DataObjectEditorModel;
  protected queryEditorModel: DomainEditorModel;

  @derive
  protected get entities() {
    return this.domainEditorModel.domainObjectStore.entities.map(i => i.dsl) as ISourceObject[];
  }

  @derive
  protected get valueObjects() {
    return this.domainEditorModel.domainObjectStore.valueObjects.map(i => i.dsl) as ISourceObject[];
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
  }) {
    const { domainEditorModel, dataObjectEditorModel, queryEditorModel } = inject;

    this.domainEditorModel = domainEditorModel;
    this.queryEditorModel = queryEditorModel;
    this.dataObjectEditorModel = dataObjectEditorModel;

    makeObservable(this);
  }

  getSourceObjectById(id: string): ISourceObject | undefined {
    return (
      this.domainEditorModel.domainObjectStore.getObjectById(id) ||
      this.queryEditorModel.domainObjectStore.getObjectById(id)
    )?.dsl as ISourceObject;
  }

  getTargetObjectById(id: string): ITargetObject | undefined {
    return this.dataObjectEditorModel.dataObjectStore.getObjectById(id)?.dsl as ITargetObject;
  }
}
