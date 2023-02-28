import { makeObservable, observable } from 'mobx';
import { applyUpdate, Doc as YDoc, encodeStateAsUpdate } from 'yjs';
import { WebrtcProvider } from 'y-webrtc';
import { message } from 'antd';
import Router from 'next/router';
import { effect, makeAutoBindThis, mutation } from '@/lib/store';
import { IDisposable } from '@/lib/utils';

import { DesignerKeyboardBinding } from './DesignerKeyboardBinding';
import { IDesignerTab } from './IDesignerTab';
import { IDesigner } from './IDesigner';
import { DesignerAwareness } from './DesignerAwareness';
import { createYjsProvider } from './createYjsProvider';

export interface BaseDesignerModelOptions {
  name: string;
  id: string;
  readonly?: boolean;
}

/**
 * 设计器模型
 */
export abstract class BaseDesignerModel<Tab extends string, State extends {} = {}> implements IDisposable, IDesigner {
  readonly name: string;
  readonly id: string;

  readonly readonly: boolean;

  readonly keyboardBinding: DesignerKeyboardBinding;

  readonly awareness: DesignerAwareness<State>;

  /**
   * 当前激活的 Tab
   */
  abstract activeTab: Tab;

  @observable
  saving = false;

  @observable
  loading = false;

  @observable
  error?: Error;

  get awarenessStates() {
    return this.awareness.remoteStatesInArray;
  }

  readonly ydoc: YDoc;
  protected webrtcProvider?: WebrtcProvider;

  /**
   * Tab 模型
   */
  protected tabs: { key: Tab; model: IDesignerTab }[] = [];

  /**
   * 加载数据
   * @param params
   */
  protected abstract loadData(params: { id: string }): Promise<ArrayBuffer>;

  /**
   * 保存数据
   * @param params
   */
  protected abstract saveData(params: { id: string; data: Uint8Array }): Promise<void>;

  /**
   * 加载保存向量
   * @param params
   */
  protected abstract loadVector(params: { id: string }): Promise<ArrayBuffer | undefined>;

  constructor(options: BaseDesignerModelOptions) {
    const { id, name, readonly = false } = options;
    this.name = name;
    this.id = id;
    this.readonly = readonly;

    this.ydoc = new YDoc();

    this.keyboardBinding = new DesignerKeyboardBinding({ model: this });
    this.awareness = new DesignerAwareness({ doc: this.ydoc });

    makeAutoBindThis(this);
    makeObservable(this);

    // @ts-expect-error
    globalThis.__DESIGNER__ = this;
  }

  initialize() {
    // Tab 恢复
    Router.ready(() => {
      const activeKey = Router.query.tab as Tab | undefined;
      if (activeKey != null) {
        this.setActiveTab({ tab: activeKey });
      }
    });
  }

  /**
   * 销毁
   */
  dispose() {
    if (this.webrtcProvider) {
      this.webrtcProvider.destroy();
      this.webrtcProvider = undefined;
    }

    this.ydoc.destroy();
  }

  /**
   * 配置用户会话状态
   * @param state
   */
  setAwarenessState(state: Partial<State>) {
    this.awareness.setState(state);
  }

  /**
   * 数据加载
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

      const buf = await this.loadData({ id: this.id });
      const update = new Uint8Array(buf);

      if (update.length) {
        applyUpdate(this.ydoc, update);
      }

      // 多人协作
      if (!this.readonly) {
        this.webrtcProvider = createYjsProvider({
          doc: this.ydoc,
          id: `${this.name}-${this.id}`,
          awareness: this.awareness.awareness,
        });
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

      // 验证所有 tab
      const validateResults = await Promise.all(this.tabs.map(i => i.model.validate()));

      const errorIdx = validateResults.findIndex(Boolean);
      if (errorIdx !== -1) {
        this.setActiveTab({ tab: this.tabs[errorIdx].key });
        throw new Error(`数据验证错误，请修正后重试`);
      }

      const vector = await this.getVector();

      const update = encodeStateAsUpdate(this.ydoc, vector);

      await this.saveData({ id: this.id, data: update });

      this.setError(undefined);
      message.success('保存成功');
    } catch (err) {
      this.setError(err as Error);
    } finally {
      this.setSaving(false);
    }
  }

  @mutation('DESIGNER:SET_ACTIVE_TAB', false)
  setActiveTab(params: { tab: Tab }) {
    const tab = (this.activeTab = params.tab);

    // 激活对应的 Tab
    this.tabs.find(i => i.key === tab)?.model.active();

    // 持久化当前 Tab
    const url = new URL(Router.asPath, window.location.href);
    url.searchParams.set('tab', tab);
    Router.replace(url, undefined, { shallow: true });
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

  protected async getVector() {
    try {
      const buffer = await this.loadVector({ id: this.id });
      if (buffer) {
        return new Uint8Array(buffer);
      }
    } catch (err) {
      console.error(`获取保存向量失败：`, err);
    }

    return undefined;
  }
}
