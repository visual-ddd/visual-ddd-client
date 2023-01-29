export interface UbiquitousLanguageItem {
  /**
   * 唯一 id
   */
  uuid: string;

  /**
   * 概念
   */
  conception: string;

  /**
   * 英文名
   */
  englishName: string;

  /**
   * 定义
   */
  definition: string;

  /**
   * 约束
   */
  restraint: string;

  /**
   * 举例
   */
  example: string;
}

export interface IUbiquitousLanguageModel {
  readonly list: UbiquitousLanguageItem[];

  isEditing(id: string, key: keyof UbiquitousLanguageItem): boolean;

  setEditing(params: { id: string; key: keyof UbiquitousLanguageItem; editing: boolean }): void;

  updateItem(params: { uuid: string; key: keyof UbiquitousLanguageItem; value: string }): void;

  addItem(order?: 'push' | 'unshift'): void;

  removeItem(id: string): void;
}
