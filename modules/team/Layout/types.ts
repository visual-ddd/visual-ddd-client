export interface LayoutMenuItem {
  /**
   * 路由
   */
  route: string;

  /**
   * 精确匹配
   */
  exact?: boolean;

  /**
   * 名称
   */
  name: React.ReactNode;
}

export interface LayoutMenu {
  /**
   * 图标
   */
  icon: React.ReactNode;

  /**
   * 精确匹配
   */
  exact?: boolean;

  /**
   * 路由
   */
  route: string;

  /**
   * 名称
   */
  name: React.ReactNode;

  /**
   * 子菜单
   */
  children?: LayoutMenuItem[];
}

export interface LayoutAction {
  name: React.ReactNode;

  /**
   * 处理器
   * @returns
   */
  handler: () => void;
}
