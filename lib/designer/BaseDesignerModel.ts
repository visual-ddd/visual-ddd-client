import { makeObservable, observable } from 'mobx';
import { applyUpdate, Doc as YDoc, encodeStateAsUpdate, encodeStateVector } from 'yjs';
import { booleanPredicate, debounce } from '@wakeapp/utils';
import unionBy from 'lodash/unionBy';
import memoize from 'lodash/memoize';
import { message } from 'antd';
import Router from 'next/router';
import { derive, effect, makeAutoBindThis, mutation } from '@/lib/store';
import { IDisposable, IdleTaskExecutor } from '@/lib/utils';
import { getReadableContent, reverseUpdate } from '@/lib/yjs-reverse';

import { DesignerKeyboardBinding } from './DesignerKeyboardBinding';
import { IDesignerTab } from './IDesignerTab';
import { IDesigner } from './IDesigner';
import { BaseDesignerAwarenessState, DesignerAwareness } from './DesignerAwareness';
import { createYjsLocalProvider, createYjsProvider, YjsProviderDisposer } from './createYjsProvider';
import { DesignerAwarenessDelegate } from './DesignerAwarenessDelegate';
import { HistoryManager } from './HistoryManager';
import type { HistoryItem } from './HistoryManager';

export interface BaseDesignerModelOptions {
  name: string;
  id: string;
  readonly?: boolean;
}

/**
 * 协作链接状态
 */
export enum CollaborationStatus {
  Offline = 'offline',
  Connected = 'connected',
  Error = 'error',
}

export interface CollaborationDescription {
  status: CollaborationStatus;
  /**
   * 状态描述
   */
  description?: string;
}

/**
 * 设计器模型
 */
export abstract class BaseDesignerModel<
    Tab extends string,
    State extends BaseDesignerAwarenessState = BaseDesignerAwarenessState
  >
  extends IdleTaskExecutor
  implements IDisposable, IDesigner
{
  readonly name: string;
  readonly id: string;

  readonly readonly: boolean;

  readonly keyboardBinding: DesignerKeyboardBinding;

  readonly awareness: DesignerAwareness<State>;

  readonly historyManager: HistoryManager;

  get rawAwareness() {
    return this.awareness.awareness;
  }

  /**
   * 多人协作状态
   */
  @observable
  collaborationStatus: CollaborationDescription = {
    status: CollaborationStatus.Offline,
    description: undefined,
  };

  /**
   * 当前激活的 Tab
   */
  abstract activeTab: Tab;

  @observable
  saving = false;

  @observable
  loading = false;

  @observable
  refreshing = false;

  @observable
  error?: Error;

  get awarenessStates() {
    return this.awareness.remoteStatesInArray;
  }

  /**
   * 参与协作的用户
   */
  @derive
  get awarenessUsers() {
    return unionBy(this.awarenessStates.map(i => i.user).filter(booleanPredicate), i => i.id);
  }

  readonly ydoc: YDoc;

  protected remoteProvider?: YjsProviderDisposer;

  /**
   * Tab 模型
   */
  protected tabs: { key: Tab; model: IDesignerTab }[] = [];

  /**
   * 本地 provider 就绪
   */
  private localProviderSynced = false;

  /**
   * 加载数据
   * @param params
   */
  protected abstract loadData(params: { id: string }): Promise<ArrayBuffer>;

  /**
   * 保存数据
   * @param params
   * @returns 返回保存后的数据
   */
  protected abstract saveData(params: {
    id: string;
    /**
     * 本地 vector
     */
    vector: Uint8Array;

    /**
     * 待保存的数据
     */
    data: Uint8Array;
    /**
     * 是否为增量更新
     */
    isDiff: boolean;
  }): Promise<Uint8Array>;
  /**
   * 加载保存向量
   * @param params
   */
  protected abstract loadVector(params: { id: string }): Promise<ArrayBuffer | undefined>;

  /**
   * 获取服务器差值
   * @param params
   */
  protected abstract getDiff(params: { id: string; vector: Uint8Array }): Promise<ArrayBuffer>;

  constructor(options: BaseDesignerModelOptions) {
    super();
    const { id, name, readonly = false } = options;
    this.name = name;
    this.id = id;
    this.readonly = readonly;

    this.ydoc = new YDoc();

    this.ydoc.on('update', update => {
      this.handleDocUpdate();
    });

    this.keyboardBinding = new DesignerKeyboardBinding({ model: this });
    this.awareness = new DesignerAwareness({ doc: this.ydoc });
    this.historyManager = new HistoryManager({ scope: `${name}-${id}` });

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
      } else if (this.activeTab) {
        this.setActiveTab({ tab: this.activeTab });
      }
    });
  }

  /**
   * 销毁
   */
  override dispose() {
    super.dispose();
    this.handleDocUpdate.cancel();

    if (this.remoteProvider) {
      this.remoteProvider();
      this.remoteProvider = undefined;
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

      const key = `${this.name}-${this.id}`;

      // 销毁旧的链接
      if (this.remoteProvider) {
        this.remoteProvider();
        this.remoteProvider = undefined;
      }

      const buf = await this.loadData({ id: this.id });
      const update = new Uint8Array(buf);

      if (update.length) {
        // 获取到的是全量的远程数据
        applyUpdate(this.ydoc, update);
      }

      await this.updateRemote();

      // 加载本地数据
      if (!this.localProviderSynced && !this.readonly) {
        await createYjsLocalProvider({ id: key, doc: this.ydoc });
        this.localProviderSynced = true;
      }

      // 多人协作
      if (!this.readonly) {
        this.remoteProvider = createYjsProvider({
          doc: this.ydoc,
          id: key,
          awareness: this.awareness.awareness,
          onConnected: this.onCollabConnected,
          onClose: this.onCollabDisconnected,
          onError: this.onCollabError,
        });
      }

      this.setError(undefined);

      // 重置 UndoManager
      // 避免回退到编辑器的空状态
      setTimeout(() => {
        this.resetUndoManager();
      }, 1000);
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

      const remoteUpdate = await this.saveData({
        id: this.id,
        data: update,
        vector: this.getLocalVector(),
        isDiff: !!vector,
      });

      // 刷新远程数据
      if (remoteUpdate.length) {
        applyUpdate(this.ydoc, remoteUpdate);
      }

      this.addHistory('', true);

      this.setError(undefined);
      message.success('保存成功');
    } catch (err) {
      this.setError(err as Error);
    } finally {
      this.setSaving(false);
    }
  }

  /**
   * 刷新数据
   */
  @effect('DESIGNER:REFRESH')
  async refresh() {
    if (this.refreshing) {
      return;
    }

    try {
      this.setRefreshing(true);

      const vector = encodeStateVector(this.ydoc);

      const diff = await this.getDiff({ id: this.id, vector });

      applyUpdate(this.ydoc, new Uint8Array(diff));
    } catch (err) {
      console.error('刷新文档失败: ', err);
      this.setError(err as Error);
    } finally {
      this.setRefreshing(false);
    }
  }

  /**
   * 回退到指定版本
   * @param hash
   */
  @effect('DESIGNER:REVERSE')
  async reverseToSnapshot(item: HistoryItem) {
    const snapshot = await this.historyManager.getSnapshot(item.hash);

    if (snapshot == null) {
      throw new Error('快照不存在');
    }

    if (!this.historyManager.isLocalInList) {
      // 备份本地缓存
      await this.addHistory('本地备份', false);
    }

    reverseUpdate(this.ydoc, snapshot);
  }

  /**
   * 获取当前文档的快照内容
   */
  getContextFromUpdate = memoize(async (hash: string) => {
    const snapshot = await this.historyManager.getSnapshot(hash);
    if (snapshot == null) {
      throw new Error('快照不存在');
    }

    return getReadableContent(this.ydoc, snapshot);
  });

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

  @mutation('DESIGNER:SET_REFRESHING', false)
  protected setRefreshing(refreshing: boolean) {
    this.refreshing = refreshing;
  }

  @mutation('DESIGNER:SET_ERROR', false)
  protected setError(error?: Error) {
    this.error = error;
  }

  /**
   * 获取本地 vector
   * @returns
   */
  protected getLocalVector() {
    return encodeStateVector(this.ydoc);
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

  protected createAwarenessDelegate<Key extends keyof State>(key: Key) {
    return new DesignerAwarenessDelegate({
      awareness: this.awareness,
      key: key,
    });
  }

  protected resetUndoManager() {
    this.tabs.forEach(i => i.model.clearUndoStack());
  }

  /**
   * 多人协作已连接
   */
  @mutation('DESIGNER:COLLAB_CONNECTED', false)
  protected onCollabConnected() {
    this.collaborationStatus.status = CollaborationStatus.Connected;
    this.collaborationStatus.description = '已连接, 信号良好';
  }

  /**
   * 多人协作已断开
   */
  @mutation('DESIGNER:COLLAB_DISCONNECTED', false)
  protected onCollabDisconnected() {
    this.collaborationStatus.status = CollaborationStatus.Offline;
    this.collaborationStatus.description = '协作网络已断开, 请检查';
  }

  /**
   * 多人协作报错
   */
  @mutation('DESIGNER:COLLAB_ERROR', false)
  protected onCollabError(err: Error) {
    this.collaborationStatus.status = CollaborationStatus.Error;
    this.collaborationStatus.description = err.message;
  }

  protected updateRemote() {
    return this.historyManager.updateRemote(this.ydoc);
  }

  protected handleDocUpdate = debounce(
    () => {
      this.addIdleTask(() => {
        this.historyManager.updateLocal(this.ydoc);
      });
    },
    3000,
    { leading: true }
  );

  protected addHistory(note?: string, asRemote?: boolean) {
    return this.historyManager.unshift(this.ydoc, note, asRemote);
  }
}
