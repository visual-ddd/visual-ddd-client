import { Doc as YDoc, encodeStateAsUpdate, applyUpdate } from 'yjs';
import { WebrtcProvider } from 'y-webrtc';
import { effect, makeAutoBindThis, mutation } from '@/lib/store';
import { makeObservable, observable } from 'mobx';

import { DomainEditorModel, createDomainEditorModel } from '../../domain-design';
import { createQueryEditorModel } from '../../query-design';
import { YJS_FIELD_NAME } from '../../constants';
import { createDataObjectEditorModel, DataObjectEditorModel } from '../../data-design';
import { UbiquitousLanguageModel } from '../../ubiquitous-language-design';

import { DomainDesignerTabs } from './constants';

const KEY_ACTIVE_TAB = 'DESIGNER:activeTab';

interface TabModel {
  /**
   * 激活
   * @returns
   */
  active: () => void;

  validate(): Promise<boolean>;
}

export class DomainDesignerModel {
  id: string;
  readonly readonly: boolean;

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
   * 当前激活的 Tab
   */
  @observable
  activeTab: DomainDesignerTabs = DomainDesignerTabs.Product;

  @observable
  saving = false;

  @observable
  loading = false;

  @observable
  error?: Error;

  readonly ydoc: YDoc;
  private tabs: { key: DomainDesignerTabs; model: TabModel }[];

  constructor(options: { id: string; readonly?: boolean }) {
    const { id, readonly = false } = options;
    this.id = id;
    this.readonly = readonly;

    const doc = (this.ydoc = new YDoc());

    const domainDatabase = doc.getMap(YJS_FIELD_NAME.DOMAIN);
    const queryDatabase = doc.getMap(YJS_FIELD_NAME.QUERY);
    const dataObjectDatabase = doc.getMap(YJS_FIELD_NAME.DATA_OBJECT);
    const ubiquitousLanguageDatabase = doc.getArray<any>(YJS_FIELD_NAME.UBIQUITOUS_LANGUAGE);

    // TODO: 观测加载状态
    new WebrtcProvider(id, doc);

    this.domainEditorModel = createDomainEditorModel({ datasource: domainDatabase, doc: this.ydoc, readonly });
    this.queryEditorModel = createQueryEditorModel({ datasource: queryDatabase, doc: this.ydoc, readonly });
    this.dataObjectEditorModel = createDataObjectEditorModel({
      datasource: dataObjectDatabase,
      doc: this.ydoc,
      readonly,
    });
    this.ubiquitousLanguageModel = new UbiquitousLanguageModel({
      doc: this.ydoc,
      datasource: ubiquitousLanguageDatabase,
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
    ];

    makeAutoBindThis(this);
    makeObservable(this);

    this.initialize();
  }

  /**
   * 数据加载
   */
  @effect('DESIGNER:LOAD')
  async load() {
    try {
      this.setLoading(true);

      // 数据加载
      const response = await fetch(`/api/domain/${this.id}`, { method: 'GET' });

      if (!response.ok) {
        throw new Error(`数据加载失败`);
      }

      const buf = await response.arrayBuffer();
      const update = new Uint8Array(buf);

      if (update.length) {
        applyUpdate(this.ydoc, update);
      }

      this.setError(undefined);
    } catch (err) {
      this.setError(err as Error);
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * 数据保存
   */
  @effect('DESIGNER:SAVE')
  async save() {
    if (this.saving) {
      return;
    }

    try {
      this.setSaving(true);
      const validateResults = await Promise.all(this.tabs.map(i => i.model.validate()));

      const errorIdx = validateResults.findIndex(Boolean);
      if (errorIdx !== -1) {
        this.setActiveTab({ tab: this.tabs[errorIdx].key });
        throw new Error(`数据验证错误，请修正后重试`);
      }

      const vector = await this.getVector();

      const update = encodeStateAsUpdate(this.ydoc, vector);

      const response = await fetch(`/api/domain/${this.id}`, { method: 'PUT', body: update });

      if (!response.ok) {
        throw new Error(`保存失败`);
      }

      this.setError(undefined);
    } catch (err) {
      this.setError(err as Error);
    } finally {
      this.setSaving(false);
    }
  }

  @mutation('DESIGNER:SET_ACTIVE_TAB', false)
  setActiveTab(params: { tab: DomainDesignerTabs }) {
    const tab = (this.activeTab = params.tab);

    localStorage.setItem(KEY_ACTIVE_TAB, this.activeTab);

    this.tabs.find(i => i.key === tab)?.model.active();
  }

  @mutation('DESIGNER:SET_SAVING', false)
  protected setSaving(saving: boolean) {
    this.saving = saving;
  }

  @mutation('DESIGNER:SET_LOADING', false)
  protected setLoading(loading: boolean) {
    this.loading = loading;
  }

  @mutation('DESIGNER:SET_ERROR', false)
  protected setError(error?: Error) {
    this.error = error;
  }

  protected async initialize() {
    const activeKey = await localStorage.getItem(KEY_ACTIVE_TAB);
    if (activeKey != null) {
      this.setActiveTab({ tab: activeKey as DomainDesignerTabs });
    } else {
      this.setActiveTab({ tab: DomainDesignerTabs.Product });
    }
  }

  protected async getVector() {
    const res = await fetch(`/api/domain/${this.id}/vector`, { method: 'GET' });

    if (res.status === 200) {
      const buffer = await res.arrayBuffer();

      return new Uint8Array(buffer);
    }

    return undefined;
  }
}
