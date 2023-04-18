import { makeObservable, observable } from 'mobx';
import { derive, makeAutoBindThis, mutation } from '@/lib/store';
import { v4 } from 'uuid';
import memoize from 'lodash/memoize';
import Fuse from 'fuse.js';
import { Prompt } from './types';
import { debounce } from 'lodash';

/**
 * 主题库
 * 可以从以下渠道获取实用的 prompt
 *
 * https://github.com/f/awesome-chatgpt-prompts
 * https://github.com/PlexPt/awesome-chatgpt-prompts-zh
 */
export class BotPromptLibraryModel {
  /**
   * 主题库
   */
  @observable
  list: Prompt[] = [];

  /**
   * 当前选择的分类
   */
  @observable
  category?: string;

  /**
   * 所有支持的分类
   */
  @derive
  get categories() {
    return Array.from(
      this.list
        .reduce((acc, item) => {
          item.category.forEach(category => {
            acc.add(category);
          });
          return acc;
        }, new Set<string>())
        .values()
    );
  }

  /**
   * 按照分类筛选的列表
   */
  @derive
  get filteredByCategory(): Prompt[] {
    if (!this.category) {
      return this.list;
    }

    return this.getListByCategory(this.category!);
  }

  /**
   * fuse 实例
   */
  @derive
  get fuseStore() {
    return this.getFuseStore(this.filteredByCategory);
  }

  /**
   * 搜索关键字
   */
  @observable
  query: string = '';

  @observable
  queryDebounced: string = '';

  /**
   * 筛选后的列表
   */
  @derive
  get filteredByQuery(): Prompt[] {
    if (!this.queryDebounced) {
      return this.filteredByCategory;
    }

    return this.fuseStore.search(this.queryDebounced).map(item => item.item);
  }

  constructor() {
    makeAutoBindThis(this);
    makeObservable(this);
  }

  /**
   * 设置分类
   * @param category
   */
  @mutation('PROMPT_LIBRARY:SET_CATEGORY', false)
  setCategory(category: string) {
    this.category = category;
  }

  /**
   * 数据加载
   */
  async initial() {
    const res = await fetch('/prompt.json');
    const list = (await res.json()) as Prompt[];

    this.setList(
      list
        .map(i => {
          i.uuid = v4();
          return i;
        })
        .sort((i, j) => (new Date(i.date) > new Date(j.date) ? -1 : 1))
    );

    // 清理缓存
    this.getListByCategory.cache.clear?.();
    this.getFuseStore.cache.clear?.();
  }

  @mutation('PROMPT_LIBRARY:SET_QUERY', false)
  setQuery(query: string) {
    this.query = query;
    this.search(query);
  }

  /**
   * 搜索
   */
  protected search = debounce((value: string) => {
    this.setQueryDebounced(value);
  }, 500);

  @mutation('PROMPT_LIBRARY:SET_QUERY_DEBOUNCED', false)
  protected setQueryDebounced(query: string) {
    this.queryDebounced = query;
  }

  @mutation('PROMPT_LIBRARY:SET_LIST', false)
  protected setList(list: Prompt[]) {
    this.list = list;
  }

  /**
   * 缓存筛选的结果
   */
  private getListByCategory = memoize((category: string) => {
    return this.list.filter(item => {
      return item.category.includes(category);
    });
  });

  private getFuseStore = memoize((list: Prompt[]) => {
    return new Fuse(list, { keys: ['name', 'description', 'introduction', 'system'] });
  });
}
