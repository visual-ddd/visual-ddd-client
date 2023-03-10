import { Map as YMap } from 'yjs';
import { UbiquitousLanguageItem } from '../types';

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

  toYMap(): YMap<string> {
    return this.map;
  }
}
