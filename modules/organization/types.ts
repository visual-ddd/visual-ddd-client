import { OrganizationDetail } from '@/modules/system/types';

export interface TeamDetail {
  /**
   * 团队名称
   */
  name: string;
  id: number;
  createBy: string;
  createTime: string;
  description: string;
  /**
   * 	所属组织ID
   */
  organizationId: number;

  /**
   * 关联的组织详情
   */
  organizationDTO: OrganizationDetail;
  /**
   * 	团队管理员ID(账号id)
   */
  teamManagerId: number;
  /**
   * 	团队管理员名称
   */
  teamManagerName: string;
  updateBy: string;
  updateTime: string;
}

export interface TeamCreatePayload {
  description: string;
  name: string;
  organizationId: number;
  teamManagerId: number;
}

export interface TeamUpdatePayload {
  description: string;
  name: string;
  organizationId: number;
  id: number;
  teamManagerId: number;
}

/**
 * 成员类型枚举
 */
export enum TeamMemberRole {
  /**
   * 产品经理
   */
  ProductManager = 1,

  /**
   * 架构师
   */
  Architect = 2,

  /**
   * 开发者
   */
  Developer = 3,
}

export const MemberRoleOptions = [
  {
    label: '产品经理',
    value: TeamMemberRole.ProductManager,
  },
  {
    label: '架构师',
    value: TeamMemberRole.Architect,
  },
  {
    label: '开发者',
    value: TeamMemberRole.Developer,
  },
];

export const DEFAULT_ROLE = [TeamMemberRole.Developer];

export interface TeamMemberItem {
  accountId: number;
  accountNo: string;
  id: number;
  memberTypeList: TeamMemberRole[];
  teamId: number;
  teamMemberName: string;
}
