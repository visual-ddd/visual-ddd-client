import { createShaHash } from '../utils/hash';
import localforage from 'localforage';

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

  constructor(options: HistoryManagerOptions) {
    this.scope = options.scope || '';
    this.recoverList();
  }

  async updateRemote(data: Uint8Array) {
    const hash = await this.getHashForData(data);

    this.remote = {
      hash,
      createDate: new Date(),
      note: '远程',
    };
  }

  async updateLocal(data: Uint8Array) {
    const hash = await this.getHashForData(data);

    this.local = {
      hash,
      createDate: new Date(),
      note: '本地',
    };
  }

  async unshift(data: Uint8Array, note?: string) {
    const hash = await this.getHashForData(data);

    if (this.isExisted(hash)) {
      return;
    }

    const item: HistoryItem = {
      hash,
      createDate: new Date(),
      note,
    };

    this.history.unshift(item);
    // 同时更新 remote 指针
    this.remote = item;
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

  private async getHashForData(data: Uint8Array) {
    return createShaHash(data);
  }
}
