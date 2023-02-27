export interface IDesignerTab {
  /**
   * 激活
   * @returns
   */
  active: () => void;

  /**
   * 数据验证
   */
  validate(): Promise<boolean>;
}
