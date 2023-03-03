import { action, computed, makeObservable, observable } from 'mobx';

export class Clipboard<T> {
  @observable.shallow
  private items: T[] = [];

  constructor() {
    makeObservable(this);
  }

  @computed
  get isEmpty() {
    return !this.items?.length;
  }

  @action
  save(items: T[]) {
    this.items = items;
  }

  get() {
    return this.items;
  }
}
