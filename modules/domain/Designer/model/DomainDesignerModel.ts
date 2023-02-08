import { Doc as YDoc, encodeStateAsUpdate, applyUpdate } from 'yjs';
import { WebrtcProvider } from 'y-webrtc';
import { effect, makeAutoBindThis, mutation } from '@/lib/store';
import { makeObservable, observable } from 'mobx';
import { IDisposable, tryDispose } from '@/lib/utils';
import { message } from 'antd';

import { YJS_FIELD_NAME } from '../../constants';
import { DomainEditorModel, createDomainEditorModel } from '../../domain-design';
import { createQueryEditorModel } from '../../query-design';
import { createDataObjectEditorModel, DataObjectEditorModel } from '../../data-design';
import { UbiquitousLanguageModel } from '../../ubiquitous-language-design';
import { createMapperEditorModel, MapperEditorModel } from '../../mapper-design';

import { DomainDesignerTabs } from './constants';
import { ObjectStore } from './ObjectStore';
import { DomainDesignerKeyboardBinding } from './KeyboardBinding';
import { extraRestErrorMessage } from '@/modules/backend-client';

const KEY_ACTIVE_TAB = 'DESIGNER:activeTab';

interface TabModel {
  /**
   * 激活
   * @returns
   */
  active: () => void;

  validate(): Promise<boolean>;
}

/**
 * 业务域设计器模型
 */
export class DomainDesignerModel implements IDisposable {
  id: string;
  readonly readonly: boolean;
  readonly keyboardBinding: DomainDesignerKeyboardBinding;

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
  private webrtcProvider?: WebrtcProvider;
  private tabs: { key: DomainDesignerTabs; model: TabModel }[];

  constructor(options: { id: string; readonly?: boolean }) {
    const { id, readonly = false } = options;
    this.id = id;
    this.readonly = readonly;

    const doc = (this.ydoc = new YDoc());

    const domainDatabase = doc.getMap(YJS_FIELD_NAME.DOMAIN);
    const queryDatabase = doc.getMap(YJS_FIELD_NAME.QUERY);
    const dataObjectDatabase = doc.getMap(YJS_FIELD_NAME.DATA_OBJECT);
    const mapperDatabase = doc.getMap(YJS_FIELD_NAME.MAPPER);
    const ubiquitousLanguageDatabase = doc.getArray<any>(YJS_FIELD_NAME.UBIQUITOUS_LANGUAGE);

    this.domainEditorModel = createDomainEditorModel({ datasource: domainDatabase, doc: this.ydoc, readonly });
    this.queryEditorModel = createQueryEditorModel({ datasource: queryDatabase, doc: this.ydoc, readonly });
    this.dataObjectEditorModel = createDataObjectEditorModel({
      datasource: dataObjectDatabase,
      doc: this.ydoc,
      readonly,
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

    this.keyboardBinding = new DomainDesignerKeyboardBinding({ model: this });

    makeAutoBindThis(this);
    makeObservable(this);

    this.initialize();
  }

  /**
   * 销毁
   */
  dispose() {
    if (this.webrtcProvider) {
      this.webrtcProvider.destroy();
      this.webrtcProvider = undefined;
    }

    tryDispose(this.ubiquitousLanguageModel);
    tryDispose(this.domainEditorModel);
    tryDispose(this.queryEditorModel);
    tryDispose(this.dataObjectEditorModel);
    tryDispose(this.mapperObjectEditorModel);

    this.ydoc.destroy();
  }

  /**
   * 数据加载
   * TODO: 可重试
   */
  @effect('DESIGNER:LOAD')
  async load() {
    try {
      this.setLoading(true);

      // 销毁旧的链接
      if (this.webrtcProvider) {
        this.webrtcProvider.destroy();
        this.webrtcProvider = undefined;
      }

      // 数据加载
      const response = await fetch(`/api/rest/domain/${this.id}`, { method: 'GET' });

      if (!response.ok) {
        const message = await extraRestErrorMessage(response);
        throw new Error(message || '数据加载失败');
      }

      const buf = await response.arrayBuffer();
      const update = new Uint8Array(buf);

      if (update.length) {
        applyUpdate(this.ydoc, update);
      }

      // 多人协作
      if (!this.readonly) {
        this.webrtcProvider = new WebrtcProvider(this.id, this.ydoc);
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

      const response = await fetch(`/api/rest/domain/${this.id}`, { method: 'PUT', body: update });

      if (!response.ok) {
        const message = await extraRestErrorMessage(response);
        throw new Error(message || '保存失败');
      }

      this.setError(undefined);
      message.success('保存成功');
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
    const res = await fetch(`/api/rest/domain/${this.id}/vector`, { method: 'GET' });

    if (res.ok) {
      const buffer = await res.arrayBuffer();

      return new Uint8Array(buffer);
    }

    return undefined;
  }
}
