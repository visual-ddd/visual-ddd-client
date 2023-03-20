import { makeAutoBindThis, mutation } from '@/lib/store';
import { IUbiquitousLanguageModel, UbiquitousLanguageItem } from '@/modules/domain/ubiquitous-language-design/types';
import { UbiquitousLanguageEvent } from '@/modules/domain/ubiquitous-language-design/UbiquitousLanguageEvents';
import { UbiquitousLanguageFuseStore } from '@/modules/domain/ubiquitous-language-design/UbiquitousLanguageFuseStore';
import { message } from 'antd';
import debounce from 'lodash/debounce';
import { makeObservable, observable, reaction, computed } from 'mobx';

export interface LanguageModelProps {
  fetcher: () => Promise<UbiquitousLanguageItem[]>;

  /**
   * 新增
   */
  add(initialValue: Partial<UbiquitousLanguageItem>): Promise<UbiquitousLanguageItem>;

  /**
   * 删除节点
   * @param ids
   */
  remove(ids: string[]): Promise<void>;

  /**
   * 更新节点
   * @param item
   */
  update(item: UbiquitousLanguageItem): Promise<void>;

  exportExcel(): void;

  /**
   * 导入 excel
   * @param params
   */
  importExcel(params: { file: File }): Promise<void>;
}

/**
 * 组织、团队统一语言模型
 */
export class LanguageModel implements IUbiquitousLanguageModel {
  readonly: boolean = false;

  readonly sortable = false;

  @observable
  loading: boolean = false;

  @observable
  error?: Error | undefined;

  /**
   * 列表
   */
  @observable
  innerList: UbiquitousLanguageItem[] = [];

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
   * 唯一 id 列表
   */
  @computed
  get ids() {
    return this.innerList.map(i => i.uuid);
  }

  @computed
  get selectingItems(): UbiquitousLanguageItem[] {
    return this.innerList.filter(i => this.selecting.includes(i.uuid));
  }

  private props: LanguageModelProps;
  private event: UbiquitousLanguageEvent = new UbiquitousLanguageEvent();
  private fuseStore = new UbiquitousLanguageFuseStore();
  private idsToRemove: string[] = [];

  constructor(props: LanguageModelProps) {
    this.props = props;

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

    // 条项新增
    this.event.on('ITEM_ADDED', ({ item, index }) => {
      this.fuseStore.add(item);
    });

    // 条项移除
    this.event.on('ITEM_REMOVED', ({ item, index }) => {
      this.fuseStore.remove(item);
    });

    // 条项更新
    this.event.on('ITEM_UPDATED', ({ item, key, value }) => {
      this.fuseStore.update(item, key, value);
    });
  }

  /**
   * 初始化, 获取列表
   */
  async initialize() {
    try {
      this.setLoading(true);
      this.setError(undefined);

      const list = await this.props.fetcher();

      this.setList(list);

      // 初始化 fuse store

      for (const item of list) {
        this.fuseStore.add(item);
      }
    } catch (err) {
      console.log(`获取统一语言失败:`, err);
      this.setError(err as Error);
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * 刷新列表
   */
  async refresh() {
    this.fuseStore.clear();
    await this.initialize();
  }

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

  @mutation('UBL_CLEAN_SELECTING', false)
  cleanSelecting(): void {
    this.selecting = [];
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
    this.requestToUpdate(item);
  }

  @mutation('UBL_REMOVE_ITEM', false)
  removeItem(params: { uuid: string }) {
    const { uuid: id } = params;
    const index = this.innerList.findIndex(item => item.uuid === id);

    if (index !== -1) {
      const item = this.innerList[index];
      this.innerList.splice(index, 1);
      this.event.emit('ITEM_REMOVED', { item, index });
      this.requestRemove(item.uuid);
    }
  }

  @mutation('UBL_REMOVE_SELECTING', false)
  removeSelecting(): void {
    for (const id of this.selecting) {
      this.removeItem({ uuid: id });
    }
  }

  exportExcel = async () => {
    try {
      await this.props.exportExcel();
    } catch (err) {
      message.error(`导出失败：${(err as Error).message}`);
    }
  };

  importExcel: IUbiquitousLanguageModel['importExcel'] = async params => {
    try {
      await this.props.importExcel(params);

      // 刷新
      this.refresh();
    } catch (err) {
      message.error(`导入失败：${(err as Error).message}`);
    }
  };

  /**
   * 新增
   * @param order
   */
  async addItem(order: 'push' | 'unshift' = 'push', defaultValue?: UbiquitousLanguageItem) {
    try {
      const item = await this.props.add(
        defaultValue ?? {
          conception: '',
          englishName: '',
          definition: '',
          restraint: '',
          example: '',
        }
      );

      this.addItemInner({ order, item });

      return item.uuid;
    } catch (err) {
      message.error((err as Error).message);
      throw err;
    }
  }

  @mutation('UBL_INSERT_ITEM', false)
  insertItem(params: { index: number; item: UbiquitousLanguageItem }) {
    const { index, item } = params;
    this.innerList.splice(index, 0, item);
    this.event.emit('ITEM_ADDED', { item, index });
  }

  @mutation('UBL_ADD_ITEM', false)
  private addItemInner(params: { item: UbiquitousLanguageItem; order: 'push' | 'unshift' }) {
    const { item, order } = params;
    if (order === 'push') {
      this.innerList.push(item);
      this.event.emit('ITEM_ADDED', { item, index: this.innerList.length - 1 });
    } else {
      this.innerList.unshift(item);
      this.event.emit('ITEM_ADDED', { item, index: 0 });
    }
  }

  @mutation('UB_SET_ERROR', false)
  private setError(error: Error | undefined) {
    this.error = error;
  }

  @mutation('UB_SET_LOADING', false)
  private setLoading(loading: boolean) {
    this.loading = loading;
  }

  @mutation('UB_SET_LIST', false)
  private setList(list: UbiquitousLanguageItem[]) {
    this.innerList = list;
  }

  private async requestToUpdate(item: UbiquitousLanguageItem) {
    try {
      await this.props.update(item);
    } catch (err) {
      message.error((err as Error).message);
    }
  }

  private requestRemove = (id: string) => {
    this.idsToRemove.push(id);
    this.triggerRemove();
  };

  private triggerRemove = debounce(async () => {
    if (!this.idsToRemove.length) {
      return;
    }

    const ids = this.idsToRemove;
    this.idsToRemove = [];

    try {
      await this.props.remove(ids);
    } catch (err) {
      message.error((err as Error).message);
    }
  }, 100);
}
