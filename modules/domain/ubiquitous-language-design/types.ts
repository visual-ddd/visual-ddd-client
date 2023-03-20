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
   * 唯一 id 列表
   */
  readonly ids: string[];

  /**
   * 当前选中的节点 id
   */
  readonly selecting: string[];

  /**
   * 当前选中的节点
   */
  readonly selectingItems: UbiquitousLanguageItem[];

  readonly filter: string;

  setFilter(params: { value: string }): void;

  isEditing(id: string, key: keyof UbiquitousLanguageItem): boolean;

  setEditing(params: { id: string; key: keyof UbiquitousLanguageItem; editing: boolean }): void;

  cleanSelecting(): void;

  setSelecting(ids: string[]): void;

  updateItem(params: { uuid: string; key: keyof UbiquitousLanguageItem; value: string }): void;

  /**
   * 新增
   * @param order
   * @param item
   */
  addItem(order?: 'push' | 'unshift', item?: UbiquitousLanguageItem): Promise<string> | string;

  removeItem(params: { uuid: string }): void;

  removeSelecting(): void;

  /**
   * 移动位置
   * @param from
   * @param to
   * @returns
   */
  moveItem?: (target: string, before?: string) => void;

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
