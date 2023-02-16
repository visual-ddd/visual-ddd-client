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
  loading?: boolean;
  error?: Error;

  /**
   * 只读模式
   */
  readonly readonly: boolean;

  /**
   * 是否支持排序
   */
  readonly sortable: boolean;

  /**
   * 列表，通常是过滤后的
   */
  readonly list: UbiquitousLanguageItem[];

  /**
   * 当前选中的节点
   */
  readonly selecting: string[];

  setFilter(params: { value: string }): void;

  isEditing(id: string, key: keyof UbiquitousLanguageItem): boolean;

  setEditing(params: { id: string; key: keyof UbiquitousLanguageItem; editing: boolean }): void;

  setSelecting(ids: string[]): void;

  updateItem(params: { uuid: string; key: keyof UbiquitousLanguageItem; value: string }): void;

  addItem(order?: 'push' | 'unshift'): void;

  removeItem(params: { uuid: string }): void;

  removeSelecting(): void;

  /**
   * 导出 excel
   * @returns
   */
  exportExcel?: () => Promise<void>;

  /**
   * 导入 excel
   * @param file
   * @returns
   */
  importExcel?: (params: { file: File }) => Promise<void>;
}
