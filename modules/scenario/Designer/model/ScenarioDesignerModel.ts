import { makeAutoBindThis } from '@/lib/store';
import { makeObservable, observable } from 'mobx';
import { tryDispose } from '@/lib/utils';
import { BaseDesignerModel } from '@/lib/designer';
import { extraRestErrorMessage } from '@/modules/backend-client';

import { YJS_FIELD_NAME } from '../../constants';

import { ScenarioDesignerTabs } from './constants';
import { createScenarioEditorModel, ScenarioEditorModel } from '../../scenario-design';
import { createServiceEditorModel, DomainEditorModel } from '../../service-design';
import { ScenarioServiceStore } from './ScenarioServiceStore';
import { DomainServiceStore } from './DomainServiceStore';

/**
 * 业务场景设计器模型
 */
export class ScenarioDesignerModel extends BaseDesignerModel<ScenarioDesignerTabs> {
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
    super(options);

    const doc = this.ydoc;
    const readonly = this.readonly;

    const scenarioDatabase = doc.getMap(YJS_FIELD_NAME.SCENARIO);
    const serviceDatabase = doc.getMap(YJS_FIELD_NAME.SERVICE);

    this.serviceEditorModel = createServiceEditorModel({
      datasource: serviceDatabase,
      doc,
      readonly,
    });

    const serviceStore = new ScenarioServiceStore({
      serviceEditorModel: this.serviceEditorModel,
    });

    const domainServiceStore = new DomainServiceStore();

    this.scenarioEditorModel = createScenarioEditorModel({
      datasource: scenarioDatabase,
      doc,
      readonly,
      serviceStore,
      domainServiceStore,
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

  protected async saveData(params: { id: string; data: Uint8Array }): Promise<void> {
    const { id, data } = params;
    const response = await fetch(`/api/rest/scenario/${id}`, { method: 'PUT', body: data });

    if (!response.ok) {
      const message = await extraRestErrorMessage(response);
      throw new Error(message || '保存失败');
    }
  }

  protected async loadVector(params: { id: string }): Promise<ArrayBuffer | undefined> {
    const { id } = params;

    const res = await fetch(`/api/rest/scenario/${id}/vector`, { method: 'GET' });

    if (res.ok) {
      return await res.arrayBuffer();
    }
  }
}
