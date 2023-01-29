import { makeAutoBindThis, mutation } from '@/lib/store';
import { makeObservable, observable, computed, runInAction } from 'mobx';
import { Doc as YDoc, Array as YArray, Map as YMap } from 'yjs';
import { v4 } from 'uuid';

import { IUbiquitousLanguageModel, UbiquitousLanguageItem } from './types';

export class ItemWrapper {
  static from(item: UbiquitousLanguageItem) {
    const instance = new ItemWrapper(new YMap());
    const keys = Object.keys(item) as (keyof UbiquitousLanguageItem)[];

    for (const key of keys) {
      instance.setField(key, item[key]);
    }

    return instance;
  }

  static fromMap(map: YMap<string>) {
    return new ItemWrapper(map);
  }

  readonly map: YMap<string>;

  get uuid() {
    return this.map.get('uuid')!;
  }

  private constructor(map: YMap<string>) {
    this.map = map;
  }

  getField(fieldName: keyof UbiquitousLanguageItem): string {
    return this.map.get(fieldName)!;
  }

  setField(fieldName: keyof UbiquitousLanguageItem, value: string) {
    this.map.set(fieldName, value);
  }

  toJSON(): UbiquitousLanguageItem {
    return this.map.toJSON() as UbiquitousLanguageItem;
  }
}

/**
 * 统一语言列表模型
 */
export class UbiquitousLanguageModel implements IUbiquitousLanguageModel {
  /**
   * 列表
   */
  @observable
  protected innerList: UbiquitousLanguageItem[] = [];

  @observable
  protected editing: Map<string, Set<string>> = new Map();

  /**
   * antd table 只能识别不可变数组，如果直接使用 innerList, 会导致表格无法更新
   */
  @computed
  get list() {
    return [...this.innerList];
  }

  private datasource: YArray<YMap<string>>;

  constructor(inject: { doc: YDoc; datasource: YArray<YMap<string>> }) {
    const { datasource } = inject;

    this.datasource = datasource;

    makeObservable(this);
    makeAutoBindThis(this);

    // 监听 yjs 数据变化
    datasource.observeDeep((events, transaction) => {
      // 本地触发，跳过
      if (transaction.local) {
        return;
      }

      runInAction(() => {
        for (const evt of events) {
          console.log('统一语言更新', evt);

          if (evt.target instanceof YArray) {
            // 列表更新
            let currentIndex = 0;
            for (const delta of evt.delta) {
              if (delta.retain != null) {
                currentIndex = delta.retain;
              } else if ((delta.insert as YMap<string>[] | undefined)?.length) {
                this.innerList.splice(
                  currentIndex,
                  0,
                  ...(delta.insert as YMap<string>[]).map(item => ItemWrapper.fromMap(item).toJSON())
                );
              } else if (delta.delete != null) {
                this.innerList.splice(currentIndex, delta.delete);
              }
            }
          } else if (evt.target instanceof YMap) {
            // 属性更新
            const wrapper = ItemWrapper.fromMap(evt.target);
            const item = this.innerList.find(item => item.uuid === wrapper.uuid);
            if (item != null) {
              for (const key of evt.keys.keys() as IterableIterator<keyof UbiquitousLanguageItem>) {
                item[key] = wrapper.getField(key);
              }
            }
          }
        }
      });
    });
  }

  isEditing(id: string, key: keyof UbiquitousLanguageItem): boolean {
    return !!this.editing.get(id)?.has(key);
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

  @mutation('UBL_UPDATE_ITEM', false)
  updateItem(params: { uuid: string; key: keyof UbiquitousLanguageItem; value: string }) {
    const { uuid, key, value } = params;
    const item = this.innerList.find(item => item.uuid === uuid);
    if (item == null) {
      return;
    }

    item[key] = value;
    this.datasource.forEach(i => {
      const wrapper = ItemWrapper.fromMap(i);
      if (wrapper.uuid === uuid) {
        wrapper.setField(key, value);
      }
    });
  }

  @mutation('UBL_REMOVE_ITEM', false)
  removeItem(id: string) {
    const index = this.innerList.findIndex(item => item.uuid === id);

    if (index !== -1) {
      this.innerList.splice(index, 1);
      this.datasource.delete(index, 1);
    }
  }

  @mutation('UBL_ADD_ITEM', false)
  addItem(order: 'push' | 'unshift' = 'push') {
    const item: UbiquitousLanguageItem = {
      uuid: v4(),
      conception: '请输入概念',
      englishName: '',
      definition: '',
      restraint: '',
      example: '',
    };

    const inst = ItemWrapper.from(item);

    if (order === 'push') {
      this.innerList.push(item);
      this.datasource.push([inst.map]);
    } else {
      this.innerList.unshift(item);
      this.datasource.unshift([inst.map]);
    }
  }
}
