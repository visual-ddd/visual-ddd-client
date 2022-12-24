import { action, makeObservable, observable } from 'mobx';
import localforage from 'localforage';

export class ColorHistory {
  static MAX = 12;
  static CACHE_KEY = 'color-history';

  @observable
  list: string[] = [];

  constructor() {
    this.initial();

    makeObservable(this);
  }

  async initial() {
    const list = await localforage.getItem<string[]>(ColorHistory.CACHE_KEY);
    if (list) {
      this.setList(list);
    }
  }

  @action
  push(item: string) {
    if (this.list.includes(item)) {
      return;
    }

    let clone = this.list.slice(0);
    clone.unshift(item);

    if (clone.length > ColorHistory.MAX) {
      clone = clone.slice(0, ColorHistory.MAX);
    }

    localforage.setItem(ColorHistory.CACHE_KEY, clone);

    this.list = clone;
  }

  @action
  private setList(list: string[]) {
    this.list = list;
  }
}

export const globalHistory = new ColorHistory();
