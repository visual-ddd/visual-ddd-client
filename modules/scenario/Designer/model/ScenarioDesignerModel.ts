import { makeAutoBindThis } from '@/lib/store';
import { makeObservable, observable } from 'mobx';
import { tryDispose } from '@/lib/utils';
import { BaseDesignerModel, BaseDesignerAwarenessState } from '@/lib/designer';
import { extraRestErrorMessage } from '@/modules/backend-client';

import { YJS_FIELD_NAME } from '../../constants';

import { ScenarioDesignerTabs } from './constants';
import { createScenarioEditorModel, ScenarioEditorModel } from '../../scenario-design';
import { createServiceEditorModel, DomainEditorModel } from '../../service-design';
import { ScenarioServiceStore } from './ScenarioServiceStore';
import { DomainServiceStore } from './DomainServiceStore';
import { BaseEditorAwarenessState } from '@/lib/editor';

export interface ScenarioDesignerAwarenessState extends BaseDesignerAwarenessState {
  [YJS_FIELD_NAME.SCENARIO]: BaseEditorAwarenessState;
  [YJS_FIELD_NAME.SERVICE]: BaseEditorAwarenessState;
}

/**
 * 业务场景设计器模型
 */
export class ScenarioDesignerModel extends BaseDesignerModel<ScenarioDesignerTabs, ScenarioDesignerAwarenessState> {
  /**
   * 当前激活的 Tab
   */
  @observable
  activeTab: ScenarioDesignerTabs = ScenarioDesignerTabs.Scenario;

  /**
   * 业务流程图模型
   */
  scenarioEditorModel: ScenarioEditorModel;

  /**
   * 业务场景服务
   */
  serviceEditorModel: DomainEditorModel;

  constructor(options: { id: string; readonly?: boolean }) {
    super({ ...options, name: 'scenario' });

    const doc = this.ydoc;
    const readonly = this.readonly;

    const scenarioDatabase = doc.getMap(YJS_FIELD_NAME.SCENARIO);
    const serviceDatabase = doc.getMap(YJS_FIELD_NAME.SERVICE);

    this.serviceEditorModel = createServiceEditorModel({
      datasource: serviceDatabase,
      doc,
      readonly,
      awarenessRegistry: this.createAwarenessDelegate(YJS_FIELD_NAME.SERVICE),
    });

    const serviceStore = new ScenarioServiceStore({
      serviceEditorModel: this.serviceEditorModel,
      designer: this,
    });

    const domainServiceStore = new DomainServiceStore();

    this.scenarioEditorModel = createScenarioEditorModel({
      datasource: scenarioDatabase,
      doc,
      readonly,
      serviceStore,
      domainServiceStore,
      awarenessRegistry: this.createAwarenessDelegate(YJS_FIELD_NAME.SCENARIO),
    });

    this.tabs = [
      {
        key: ScenarioDesignerTabs.Scenario,
        model: this.scenarioEditorModel,
      },
      {
        key: ScenarioDesignerTabs.Service,
        model: this.serviceEditorModel,
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
    tryDispose(this.scenarioEditorModel);
  }

  protected async loadData(params: { id: string }): Promise<ArrayBuffer> {
    const { id } = params;

    // 数据加载
    const response = await fetch(`/api/rest/scenario/${id}`, { method: 'GET' });

    if (!response.ok) {
      const message = await extraRestErrorMessage(response);
      throw new Error(message || '数据加载失败');
    }

    return await response.arrayBuffer();
  }

  protected async getDiff(params: { id: string; vector: Uint8Array }): Promise<ArrayBuffer> {
    const { id, vector } = params;
    const response = await fetch(`/api/rest/scenario/${id}/diff`, { method: 'POST', body: vector });

    if (!response.ok) {
      const msg = await extraRestErrorMessage(response);
      throw new Error(msg || '数据刷新失败');
    }

    return await response.arrayBuffer();
  }

  protected async saveData(params: {
    id: string;
    vector: Uint8Array;
    data: Uint8Array;
    isDiff: boolean;
  }): Promise<Uint8Array> {
    const { id, data, vector, isDiff } = params;
    const payload = new FormData();
    const vectorBlob = new Blob([vector], { type: 'application/octet-stream' });
    const dataBlob = new Blob([data], { type: 'application/octet-stream' });

    payload.set('vector', vectorBlob);
    payload.set('data', dataBlob);

    const response = await fetch(`/api/rest/scenario/${id}/v2?diff=${!!isDiff}`, { method: 'PUT', body: payload });

    if (!response.ok) {
      const message = await extraRestErrorMessage(response);
      throw new Error(message || '保存失败');
    }

    return new Uint8Array(await response.arrayBuffer());
  }

  protected async loadVector(params: { id: string }): Promise<ArrayBuffer | undefined> {
    const { id } = params;

    const res = await fetch(`/api/rest/scenario/${id}/vector`, { method: 'GET' });

    if (res.ok) {
      return await res.arrayBuffer();
    }
  }
}
