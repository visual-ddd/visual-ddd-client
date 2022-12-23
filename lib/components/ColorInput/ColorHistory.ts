import { action, makeObservable, observable } from 'mobx';
import localforage from 'localforage';

export class ColorHistory {
  static MAX = 12;
  static CACHE_KEY = 'color-history';
  list: string[] = [];

  constructor() {
    makeObservable(this, { list: observable, push: action });
    this.initial();
  }

  async initial() {
    const list = await localforage.getItem<string[]>(ColorHistory.CACHE_KEY);
    if (list) {
      this.list = list;
    }
  }

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
}

export const globalHistory = new ColorHistory();
