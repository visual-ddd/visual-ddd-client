import { makeAutoBindThis, mutation } from '@/lib/store';
import { makeObservable, observable, runInAction, computed, reaction, toJS } from 'mobx';
import { Doc as YDoc, Array as YArray, Map as YMap } from 'yjs';
import { v4 } from 'uuid';
import { download, request } from '@/modules/backend-client';
import pick from 'lodash/pick';

import type { IUbiquitousLanguageModel, UbiquitousLanguageItem } from './types';
import { UbiquitousLanguageEvent } from './UbiquitousLanguageEvents';
import { UbiquitousLanguageFuseStore } from './UbiquitousLanguageFuseStore';
import { ItemWrapper } from './Yjs';

const VALID_FIELDS: (keyof UbiquitousLanguageItem)[] = [
  'conception',
  'englishName',
  'definition',
  'restraint',
  'example',
];

/**
 * 统一语言列表模型
 */
export class UbiquitousLanguageModel implements IUbiquitousLanguageModel {
  readonly readonly: boolean;

  readonly sortable = true;

  /**
   * 列表
   */
  @observable
  protected innerList: UbiquitousLanguageItem[] = [];

  /**
   * 当前正在编辑
   */
  @observable
  protected editing: Map<string, Set<string>> = new Map();

  /**
   * 当前筛选
   */
  @observable
  filter: string = '';

  /**
   * 当前选中
   */
  @observable
  selecting: string[] = [];

  /**
   * antd table 只能识别不可变数组，如果直接使用 innerList, 会导致表格无法更新
   */
  @observable
  list: UbiquitousLanguageItem[] = [];

  /**
   * 所有单词
   */
  @computed
  get words(): string[] {
    const list: Set<string> = new Set();

    const push = (value: string) => {
      value = value.trim();
      if (value) {
        list.add(value);
      }
    };

    for (const item of this.innerList) {
      push(item.conception);
      push(item.englishName);
    }

    return Array.from(list);
  }

  private datasource: YArray<YMap<string>>;
  /**
   * 正在拉取远程更新, 主要用于避免循环
   */
  private datasourcePulling: boolean = false;
  private event: UbiquitousLanguageEvent = new UbiquitousLanguageEvent();
  private fuseStore = new UbiquitousLanguageFuseStore();

  constructor(inject: { doc: YDoc; datasource: YArray<YMap<string>>; readonly?: boolean }) {
    const { datasource, readonly = false } = inject;

    this.readonly = readonly;
    this.datasource = datasource;

    makeObservable(this);
    makeAutoBindThis(this);

    reaction(
      () => ({
        filter: this.filter,
        list: [...this.innerList],
      }),
      ({ filter, list }) => {
        if (!filter.trim()) {
          this.list = list;
        } else {
          const result = this.fuseStore.search(filter);
          this.list = result.map(i => i.item);
        }
      },
      { name: 'UbiquitousLanguageFilter', delay: 100, fireImmediately: true }
    );

    // 监听 yjs 数据变化
    datasource.observeDeep((events, transaction) => {
      // 本地触发，跳过
      if (transaction.local) {
        return;
      }

      runInAction(() => {
        try {
          this.datasourcePulling = true;
          for (const evt of events) {
            console.log('统一语言更新', evt);

            if (evt.target instanceof YArray) {
              // 列表更新
              let currentIndex = 0;
              for (const delta of evt.delta) {
                if (delta.retain != null) {
                  // 定位
                  currentIndex = delta.retain;
                } else if ((delta.insert as [] | undefined)?.length) {
                  const insert = delta.insert as YMap<string>[];
                  // 新增
                  for (let i = currentIndex; i < currentIndex + insert.length; i++) {
                    const itemMap = insert[i - currentIndex];
                    this.insertItem({ index: i, item: ItemWrapper.fromMap(itemMap).toJSON() });
                  }
                } else if (delta.delete != null) {
                  // 移除
                  const clone = [...this.innerList];
                  const deleted = clone.splice(currentIndex, delta.delete);
                  for (const item of deleted) {
                    this.removeItem({ uuid: item.uuid });
                  }
                }
              }
            } else if (evt.target instanceof YMap) {
              // 属性更新
              const wrapper = ItemWrapper.fromMap(evt.target);
              const item = this.innerList.find(item => item.uuid === wrapper.uuid);
              if (item != null) {
                for (const key of evt.keys.keys() as IterableIterator<keyof UbiquitousLanguageItem>) {
                  const value = wrapper.getField(key);
                  if (value !== item[key]) {
                    this.updateItem({ uuid: item.uuid, key, value });
                  }
                }
              }
            }
          }
        } finally {
          this.datasourcePulling = false;
        }
      });
    });

    // 条项新增
    this.event.on('ITEM_ADDED', ({ item, index }) => {
      if (!this.datasourcePulling) {
        const inst = ItemWrapper.from(item);

        this.datasource.insert(index, [inst.map]);
      }
      this.fuseStore.add(item);
    });

    // 条项移除
    this.event.on('ITEM_REMOVED', ({ item, index }) => {
      if (!this.datasourcePulling) {
        this.datasource.delete(index, 1);
      }

      this.fuseStore.remove(item);
    });

    // 条项更新
    this.event.on('ITEM_UPDATED', ({ item, key, value }) => {
      if (!this.datasourcePulling) {
        const uuid = item.uuid;
        this.datasource.forEach(i => {
          const wrapper = ItemWrapper.fromMap(i);
          if (wrapper.uuid === uuid) {
            wrapper.setField(key, value);
          }
        });
      }

      this.fuseStore.update(item, key, value);
    });
  }

  /**
   * 导出 excel
   */
  exportExcel: IUbiquitousLanguageModel['exportExcel'] = async () => {
    await download({
      name: '/wd/visual/web/universal-language/universal-language-export.business',
      filename: '统一语言.xlsx',
      method: 'POST',
      body: {
        list: toJS(this.innerList),
      },
    });
  };

  /**
   * 导入 excel
   * @param param0
   */
  importExcel: IUbiquitousLanguageModel['importExcel'] = async ({ file }) => {
    const form = new FormData();
    form.append('file', file);

    const list = await request.requestByPost(
      '/wd/visual/web/universal-language/universal-language-import.business',
      form
    );

    // 插入
    for (const item of list) {
      this.pushItem({ item: pick(item, VALID_FIELDS) });
    }
  };

  isEditing(id: string, key: keyof UbiquitousLanguageItem): boolean {
    return !!this.editing.get(id)?.has(key);
  }

  @mutation('UBL_SET_FILTER', false)
  setFilter(params: { value: string }) {
    this.filter = params.value;
  }

  @mutation('UBL_SET_EDITING', false)
  setEditing(params: { id: string; key: keyof UbiquitousLanguageItem; editing: boolean }) {
    const { id, key, editing } = params;
    let set = this.editing.get(id);
    if (set == null) {
      this.editing.set(id, new Set());
      set = this.editing.get(id)!;
    }

    if (editing) {
      set.add(key);
    } else {
      set.delete(key);
    }
  }

  @mutation('UBL_SET_SELECTING', false)
  setSelecting(ids: string[]) {
    this.selecting = ids;
  }

  @mutation('UBL_UPDATE_ITEM', false)
  updateItem(params: { uuid: string; key: keyof UbiquitousLanguageItem; value: string }) {
    const { uuid, key, value } = params;
    const item = this.innerList.find(item => item.uuid === uuid);
    if (item == null) {
      return;
    }

    item[key] = value;
    this.event.emit('ITEM_UPDATED', { item, key, value });
  }

  @mutation('UBL_REMOVE_ITEM', false)
  removeItem(params: { uuid: string }) {
    const { uuid: id } = params;
    const index = this.innerList.findIndex(item => item.uuid === id);

    if (index !== -1) {
      const item = this.innerList[index];
      this.innerList.splice(index, 1);
      this.event.emit('ITEM_REMOVED', { item, index });
    }
  }

  @mutation('UBL_REMOVE_SELECTING', false)
  removeSelecting(): void {
    for (const id of this.selecting) {
      this.removeItem({ uuid: id });
    }
  }

  @mutation('UBL_ADD_ITEM', false)
  addItem(order: 'push' | 'unshift' = 'push', defaultValue?: UbiquitousLanguageItem) {
    const item: UbiquitousLanguageItem = defaultValue ?? {
      uuid: v4(),
      conception: '',
      englishName: '',
      definition: '',
      restraint: '',
      example: '',
    };

    item.uuid ||= v4();

    if (order === 'push') {
      this.innerList.push(item);
      this.event.emit('ITEM_ADDED', { item, index: this.innerList.length - 1 });
    } else {
      this.innerList.unshift(item);
      this.event.emit('ITEM_ADDED', { item, index: 0 });
    }
  }

  @mutation('UBL_INSERT_ITEM', false)
  insertItem(params: { index: number; item: UbiquitousLanguageItem }) {
    const { index, item } = params;
    this.innerList.splice(index, 0, item);
    this.event.emit('ITEM_ADDED', { item, index });
  }

  @mutation('UBL_PUSH_ITEM', false)
  private pushItem(params: { item: UbiquitousLanguageItem }) {
    const { item } = params;
    item.uuid ||= v4();

    this.innerList.push(item);
    this.event.emit('ITEM_ADDED', { item, index: this.innerList.length - 1 });
  }
}
