import Fuse from 'fuse.js';
import { UbiquitousLanguageItem } from './types';

export class UbiquitousLanguageFuseStore {
  private fuse: Fuse<UbiquitousLanguageItem>;

  constructor() {
    this.fuse = this.createFuse();
  }

  add(item: UbiquitousLanguageItem) {
    this.fuse.add(item);
  }

  remove(item: UbiquitousLanguageItem) {
    this.fuse.remove(i => {
      return i.uuid === item.uuid;
    });
  }

  update(item: UbiquitousLanguageItem, key: keyof UbiquitousLanguageItem, value: string) {
    if (key === 'conception' || key === 'englishName') {
      this.remove(item);
      this.add(item);
    }
  }

  search(filter: string) {
    return this.fuse.search(filter);
  }

  clear() {
    this.fuse = this.createFuse();
  }

  private createFuse() {
    return new Fuse<UbiquitousLanguageItem>([], { keys: ['conception', 'englishName'] });
  }
}
