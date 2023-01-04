import { Doc as YDoc } from 'yjs';
import { WebrtcProvider } from 'y-webrtc';
import { makeAutoBindThis, mutation } from '@/lib/store';

import { DomainEditorModel } from '../../domain-design';
import { makeObservable, observable } from 'mobx';
import { DomainDesignerTabs } from './constants';

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

    this.domainEditorModel = new DomainEditorModel({ datasource: domainDatabase, scopeId: 'domain', doc: this.ydoc });
    this.queryEditorModel = new DomainEditorModel({ datasource: queryDatabase, scopeId: 'query', doc: this.ydoc });

    makeAutoBindThis(this);
    makeObservable(this);
  }

  @mutation('DESIGNER:SET_ACTIVE_TAB', false)
  setActiveTab(params: { tab: DomainDesignerTabs }) {
    this.activeTab = params.tab;
  }
}
