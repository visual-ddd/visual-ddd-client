import localforage from 'localforage';
import { Doc as YDoc, encodeStateAsUpdate } from 'yjs';
import { getContentDigest } from '@/lib/yjs-reverse';
import { derive, makeAutoBindThis } from '@/lib/store';
import { makeObservable, observable, runInAction, toJS } from 'mobx';
import { formatDate } from '@wakeapp/utils';

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

export interface ExtendedHistoryItem extends HistoryItem {
  /**
   * 标题
   */
  title: string;

  /**
   * 是否支持删除
   */
  removable: boolean;
  /**
   * 是否支持恢复
   */
  recoverable: boolean;

  /**
   * 当前状态标记
   */
  local: boolean;

  /**
   * 远程状态标记
   */
  remote: boolean;
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
  @observable
  protected history: HistoryItem[] = [];

  /**
   * 远程记录的指针
   */
  @observable.ref
  protected remote?: HistoryItem;

  /**
   * 本地记录的指针
   */
  @observable.ref
  protected local?: HistoryItem;

  /**
   * 本地和远程是否同步
   */
  @derive
  get isSynced() {
    return this.local?.hash === this.remote?.hash;
  }

  /**
   * 确定当前状态是否已存在, 用于判断是否需要备份本地缓存
   * @returns
   */
  @derive
  get isLocalInList() {
    return !!(this.local && (this.isSynced || this.isExisted(this.local.hash)));
  }

  /**
   * 历史记录列表
   */
  @derive
  get list(): ExtendedHistoryItem[] {
    const histories: ExtendedHistoryItem[] = [
      ...this.history.map(i => ({
        ...i,
        title: formatDate(i.createDate, 'MM/DD HH:mm'),
        local: false,
        remote: false,
        removable: true,
        recoverable: true,
      })),
    ];

    if (this.remote) {
      const item = histories.find(i => i.hash === this.remote!.hash);
      if (item) {
        item.remote = true;
      } else {
        histories.unshift({
          ...this.remote,
          title: '线上',
          local: false,
          remote: true,
          recoverable: true,
          removable: false,
        });
      }
    }

    if (this.local) {
      const item = histories.find(i => i.hash === this.local!.hash);
      if (item) {
        item.local = true;
        item.recoverable = false;
      } else {
        histories.unshift({
          ...this.local,
          title: '当前',
          local: true,
          remote: false,
          recoverable: false,
          removable: false,
        });
      }
    }

    return histories;
  }

  private scope: string = '';

  /**
   * 已从 storage 中加载的数据
   */
  private snapshotLoaded: Map<string, Uint8Array> = new Map();

  constructor(options: HistoryManagerOptions) {
    this.scope = options.scope || '';
    makeAutoBindThis(this);
    makeObservable(this);
    this.recoverList();
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

  /**
   * 删除记录
   * @param hash
   */
  removeHistory(hash: string) {
    const index = this.history.findIndex(i => i.hash === hash);
    if (index >= 0) {
      runInAction(() => {
        this.history.splice(index, 1);
        this.saveList();
      });
    }
  }

  async updateRemote(doc: YDoc) {
    const hash = await this.getHashForDocument(doc);

    runInAction(() => {
      this.remote = {
        hash,
        createDate: new Date(),
      };
    });

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

    runInAction(() => {
      this.local = {
        hash,
        createDate: new Date(),
      };
      this.snapshotLoaded.set(hash, encodeStateAsUpdate(doc));
    });
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

    runInAction(() => {
      this.history.unshift(item);

      if (asRemote) {
        // 同时更新 remote 指针
        this.remote = item;
      }
    });

    this.snapshotLoaded.set(hash, data);

    this.saveData(hash, data);
    this.saveList();
  }

  private async recoverList() {
    const list = await storage.getItem<ListStorage>(this.keyForList());

    if (list) {
      runInAction(() => {
        this.history = list.list;
      });
    }
  }

  private saveData = (pointer: string, data: Uint8Array) => {
    storage.setItem(this.keyForData(pointer), data);
  };

  private saveList() {
    const data: ListStorage = {
      list: toJS(this.history),
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
