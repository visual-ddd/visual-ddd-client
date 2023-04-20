import localforage from 'localforage';
import { Doc as YDoc, encodeStateAsUpdate } from 'yjs';
import { getContentDigest } from '@/lib/yjs-reverse';

export interface HistoryItem {
  /**
   * 历史记录的 hash 值
   * 同时这个也是链接到实际数据的指针
   */
  hash: string;

  /**
   * 创建时间
   */
  createDate: Date;

  /**
   * 标记
   */
  note?: string;
}

const KEY_FOR_DATA = 'design-data-';
const KEY_FOR_LIST = 'design-list-';

// TODO: 长度限制和回收内存

export interface HistoryManagerOptions {
  scope?: string;
}

const storage = localforage.createInstance({ description: 'designer-history' });

interface ListStorage {
  list: HistoryItem[];
  updateTime: Date;
}

/**
 * 本地历史记录管理
 */
export class HistoryManager {
  /**
   * 历史记录
   */
  history: HistoryItem[] = [];

  /**
   * 远程记录的指针
   */
  remote?: HistoryItem;

  /**
   * 本地记录的指针
   */
  local?: HistoryItem;

  /**
   * 本地和远程是否同步
   */
  get isSynced() {
    return this.local?.hash === this.remote?.hash;
  }

  private scope: string = '';

  /**
   * 已从 storage 中加载的数据
   */
  private snapshotLoaded: Map<string, Uint8Array> = new Map();

  constructor(options: HistoryManagerOptions) {
    this.scope = options.scope || '';
    this.recoverList();
  }

  /**
   * 确定当前状态是否已存在
   * @returns
   */
  isLocalInList() {
    return !!(this.local && (this.isSynced || this.isExisted(this.local.hash)));
  }

  /**
   * 获取指定 hash 的镜像
   * @param hash
   */
  async getSnapshot(hash: string): Promise<Uint8Array | null> {
    const cache = this.snapshotLoaded.get(hash);

    if (cache) {
      return cache;
    }

    const snapshot = await storage.getItem<Uint8Array>(this.keyForData(hash));

    if (snapshot) {
      this.snapshotLoaded.set(hash, snapshot);
    }

    return snapshot;
  }

  async updateRemote(doc: YDoc) {
    const hash = await this.getHashForDocument(doc);
    this.remote = {
      hash,
      createDate: new Date(),
      note: '远程',
    };

    if (this.isExisted(hash)) {
      // 历史记录已存在
      return;
    } else {
      const data = encodeStateAsUpdate(doc);

      this.snapshotLoaded.set(hash, data);
    }
  }

  async updateLocal(doc: YDoc) {
    const hash = await this.getHashForDocument(doc);

    this.local = {
      hash,
      createDate: new Date(),
      note: '本地',
    };
  }

  async unshift(doc: YDoc, note?: string, asRemote?: boolean) {
    const hash = await this.getHashForDocument(doc);

    if (this.isExisted(hash)) {
      return;
    }

    const data = encodeStateAsUpdate(doc);

    const item: HistoryItem = {
      hash,
      createDate: new Date(),
      note,
    };

    this.history.unshift(item);

    if (asRemote) {
      // 同时更新 remote 指针
      this.remote = item;
    }

    this.snapshotLoaded.set(hash, data);

    this.saveData(hash, data);
    this.saveList();
  }

  private async recoverList() {
    const list = await storage.getItem<ListStorage>(this.keyForList());

    if (list) {
      this.history = list.list;
    }
  }

  private saveData = (pointer: string, data: Uint8Array) => {
    storage.setItem(this.keyForData(pointer), data);
  };

  private saveList() {
    const data: ListStorage = {
      list: this.history,
      updateTime: new Date(),
    };

    storage.setItem(this.keyForList(), data);
  }

  private keyForList() {
    return `${KEY_FOR_LIST}-${this.scope}`;
  }

  private keyForData(pointer: string) {
    return `${KEY_FOR_DATA}-${this.scope}-${pointer}`;
  }

  private isExisted = (hash: string) => {
    return this.history.some(item => item.hash === hash);
  };

  private async getHashForDocument(doc: YDoc) {
    return getContentDigest(doc);
  }
}
