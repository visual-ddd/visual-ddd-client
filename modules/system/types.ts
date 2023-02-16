export type UserItem = {
  /**
   * 账号
   */
  accountNo: string;
  accountRole: number;
  createBy: string;
  createTime: string;
  description: string;
  icon: string;
  id: number;
  updateBy: string;
  updateTime: string;
  /**
   * 用户名
   */
  userName: string;
};

/**
 * 组织详情
 */
export interface OrganizationDetail {
  /**
   * 组织名称
   */
  name: string;
  id: number;
  createBy: string;
  createTime: string;
  description: string;
  /**
   * 组织管理员ID(账号ID)
   */
  organizationManagerId: number;
  organizationManagerName: string;
  updateBy: string;
  updateTime: string;
}
