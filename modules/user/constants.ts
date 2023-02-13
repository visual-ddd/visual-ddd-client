/**
 * 组织类型
 */
export enum ORG_TYPE {
  /**
   * 系统管理
   */
  SYSTEM,
  /**
   * 组织管理
   */
  ORGANIZATION,
  /**
   * 团队管理
   */
  TEAM,
}

/**
 * 成员类型枚举
 */
export enum MemberType {
  /**
   * 产品经理
   */
  productManager = 1,
  /**
   * 架构师
   */
  architect = 2,
  /**
   * 开发者
   */
  developer = 3,
}

export const MemberTypeOption = [
  {
    label: '产品经理',
    value: MemberType.productManager,
  },
  {
    label: '架构师',
    value: MemberType.architect,
  },
  {
    label: '开发者',
    value: MemberType.developer,
  },
];
