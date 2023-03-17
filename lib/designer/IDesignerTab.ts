export interface IDesignerTab {
  /**
   * 激活
   * @returns
   */
  active: () => void;

  /**
   * 数据验证, 返回 true 表示验证不通过
   */
  validate: () => Promise<boolean>;

  /**
   * 清空 undo 栈
   * 因为数据加载后，会自动添加一个栈
   * @returns
   */
  clearUndoStack: () => void;
}
