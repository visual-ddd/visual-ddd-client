import { Doc as YDoc } from 'yjs';
import { WebrtcProvider } from 'y-webrtc';
import { makeAutoBindThis, mutation } from '@/lib/store';
import { makeObservable, observable } from 'mobx';

import { DomainEditorModel, createDomainEditorModel } from '../../domain-design';
import { createQueryEditorModel } from '../../query-design';

import { DomainDesignerTabs } from './constants';

const KEY_ACTIVE_TAB = 'DESIGNER:activeTab';

export class DomainDesignerModel {
  /**
   * 领域模型编辑器模型
   */
  domainEditorModel: DomainEditorModel;

  /**
   * 查询模型设计器
   */
  queryEditorModel: DomainEditorModel;

  ydoc: YDoc;

  /**
   * 当前激活的 Tab
   */
  @observable
  activeTab: DomainDesignerTabs = DomainDesignerTabs.Product;

  constructor(options: { id: string }) {
    const { id } = options;
    const doc = (this.ydoc = new YDoc());

    const domainDatabase = doc.getMap('domain');
    const queryDatabase = doc.getMap('query');

    new WebrtcProvider(id, doc);

    this.domainEditorModel = createDomainEditorModel({ datasource: domainDatabase, doc: this.ydoc });
    this.queryEditorModel = createQueryEditorModel({ datasource: queryDatabase, doc: this.ydoc });

    makeAutoBindThis(this);
    makeObservable(this);

    this.initialize();
  }

  async initialize() {
    const activeKey = await localStorage.getItem(KEY_ACTIVE_TAB);
    if (activeKey != null) {
      this.setActiveTab({ tab: activeKey as DomainDesignerTabs });
    } else {
      this.setActiveTab({ tab: DomainDesignerTabs.Product });
    }
  }

  @mutation('DESIGNER:SET_ACTIVE_TAB', false)
  setActiveTab(params: { tab: DomainDesignerTabs }) {
    const tab = (this.activeTab = params.tab);

    localStorage.setItem(KEY_ACTIVE_TAB, this.activeTab);

    switch (tab) {
      case DomainDesignerTabs.DomainModel:
        this.domainEditorModel.active();
        break;
      case DomainDesignerTabs.QueryModel:
        this.queryEditorModel.active();
        break;
    }
  }
}
