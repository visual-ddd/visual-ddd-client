import { derive, makeAutoBindThis } from '@/lib/store';
import { makeObservable, observable } from 'mobx';
import { tryDispose } from '@/lib/utils';
import { extraRestErrorMessage } from '@/modules/backend-client';
import { BaseDesignerModel, BaseDesignerAwarenessState } from '@/lib/designer';
import { booleanPredicate } from '@wakeapp/utils';
import { BaseEditorAwarenessState } from '@/lib/editor';
import unionBy from 'lodash/unionBy';

import { YJS_FIELD_NAME } from '../../constants';
import { DomainEditorModel, createDomainEditorModel } from '../../domain-design';
import { createQueryEditorModel } from '../../query-design';
import { createDataObjectEditorModel, DataObjectEditorModel } from '../../data-design';
import { UbiquitousLanguageModel } from '../../ubiquitous-language-design';
import { createMapperEditorModel, MapperEditorModel } from '../../mapper-design';

import { DomainDesignerTabs } from './constants';
import { ObjectStore } from './ObjectStore';

export interface DomainDesignerAwarenessState extends BaseDesignerAwarenessState {
  [YJS_FIELD_NAME.DOMAIN]: BaseEditorAwarenessState;
  [YJS_FIELD_NAME.QUERY]: BaseEditorAwarenessState;
  [YJS_FIELD_NAME.DATA_OBJECT]: BaseEditorAwarenessState;
  [YJS_FIELD_NAME.MAPPER]: BaseEditorAwarenessState;
}

/**
 * 业务域设计器模型
 */
export class DomainDesignerModel extends BaseDesignerModel<DomainDesignerTabs, DomainDesignerAwarenessState> {
  @observable
  activeTab: DomainDesignerTabs = DomainDesignerTabs.Vision;

  /**
   * 参与协作的用户
   */
  @derive
  get awarenessUsers() {
    return unionBy(super.awarenessStates.map(i => i.user).filter(booleanPredicate), i => i.id);
  }

  /**
   * 统一语言模型
   */
  ubiquitousLanguageModel: UbiquitousLanguageModel;

  /**
   * 领域模型编辑器模型
   */
  domainEditorModel: DomainEditorModel;

  /**
   * 查询模型设计器
   */
  queryEditorModel: DomainEditorModel;

  /**
   * 数据对象编辑器
   */
  dataObjectEditorModel: DataObjectEditorModel;

  /**
   * 对象映射编辑器
   */
  mapperObjectEditorModel: MapperEditorModel;

  constructor(options: { id: string; readonly?: boolean }) {
    super({ ...options, name: 'domain' });

    const readonly = this.readonly;
    const doc = this.ydoc;

    const domainDatabase = doc.getMap(YJS_FIELD_NAME.DOMAIN);
    const queryDatabase = doc.getMap(YJS_FIELD_NAME.QUERY);
    const dataObjectDatabase = doc.getMap(YJS_FIELD_NAME.DATA_OBJECT);
    const mapperDatabase = doc.getMap(YJS_FIELD_NAME.MAPPER);
    const ubiquitousLanguageDatabase = doc.getArray<any>(YJS_FIELD_NAME.UBIQUITOUS_LANGUAGE);

    this.domainEditorModel = createDomainEditorModel({
      datasource: domainDatabase,
      doc: this.ydoc,
      readonly,
      awarenessRegistry: this.createAwarenessDelegate(YJS_FIELD_NAME.DOMAIN),
    });
    this.queryEditorModel = createQueryEditorModel({
      datasource: queryDatabase,
      doc: this.ydoc,
      readonly,
      awarenessRegistry: this.createAwarenessDelegate(YJS_FIELD_NAME.DOMAIN),
    });
    this.dataObjectEditorModel = createDataObjectEditorModel({
      datasource: dataObjectDatabase,
      doc: this.ydoc,
      readonly,
      awarenessRegistry: this.createAwarenessDelegate(YJS_FIELD_NAME.DATA_OBJECT),
    });
    const objectStore = new ObjectStore({
      domainDesignerModel: this,
      domainEditorModel: this.domainEditorModel,
      queryEditorModel: this.queryEditorModel,
      dataObjectEditorModel: this.dataObjectEditorModel,
    });
    this.mapperObjectEditorModel = createMapperEditorModel({
      datasource: mapperDatabase,
      doc: this.ydoc,
      readonly,
      objectStore,
      awarenessRegistry: this.createAwarenessDelegate(YJS_FIELD_NAME.MAPPER),
    });
    this.ubiquitousLanguageModel = new UbiquitousLanguageModel({
      doc: this.ydoc,
      datasource: ubiquitousLanguageDatabase,
      readonly,
    });

    this.tabs = [
      {
        key: DomainDesignerTabs.DomainModel,
        model: this.domainEditorModel,
      },
      {
        key: DomainDesignerTabs.QueryModel,
        model: this.queryEditorModel,
      },
      {
        key: DomainDesignerTabs.DataModel,
        model: this.dataObjectEditorModel,
      },
      {
        key: DomainDesignerTabs.Mapper,
        model: this.mapperObjectEditorModel,
      },
    ];

    makeAutoBindThis(this);
    makeObservable(this);
  }

  /**
   * 销毁
   */
  override dispose() {
    super.dispose();

    tryDispose(this.ubiquitousLanguageModel);
    tryDispose(this.domainEditorModel);
    tryDispose(this.queryEditorModel);
    tryDispose(this.dataObjectEditorModel);
    tryDispose(this.mapperObjectEditorModel);
  }

  protected async loadData(params: { id: string }): Promise<ArrayBuffer> {
    const { id } = params;
    // 数据加载
    const response = await fetch(`/api/rest/domain/${id}`, { method: 'GET' });

    if (!response.ok) {
      const message = await extraRestErrorMessage(response);
      throw new Error(message || '数据加载失败');
    }

    return await response.arrayBuffer();
  }

  protected async saveData(params: { id: string; data: Uint8Array }): Promise<void> {
    const { id, data } = params;
    const response = await fetch(`/api/rest/domain/${id}`, { method: 'PUT', body: data });

    if (!response.ok) {
      const message = await extraRestErrorMessage(response);
      throw new Error(message || '保存失败');
    }
  }

  protected async loadVector(params: { id: string }): Promise<ArrayBuffer | undefined> {
    const res = await fetch(`/api/rest/domain/${this.id}/vector`, { method: 'GET' });
    if (res.ok) {
      return await res.arrayBuffer();
    }
  }
}
