export interface VDUser {
  /**
   * 用户标识符
   */
  accountNo: string;

  /**
   * 用户名
   */
  userName: string;

  /**
   * 描述
   */
  description: string;
}

export enum VDSessionEntry {
  /**
   * 系统管理
   */
  System = 'system',

  /**
   * 组织管理
   */
  Organization = 'organization',

  /**
   * 团队主页
   */
  Team = 'team',
}

export interface VDSessionState {
  /**
   * 当前入口类型
   * system
   */
  entry: VDSessionEntry;

  /**
   * 入口的 id, 只有组织管理和团队管理有
   */
  entryId?: string | number;

  /**
   * 是否为管理员
   */
  isManager: boolean;
}

/**
 * 会话信息核心，保存在 iron cookie 中，内容不会太长
 */
export interface VDSessionCore {
  /**
   * 后端 cookie
   */
  cookies: Record<string, string>;

  /**
   * 用户 id
   */
  accountNo: string;

  /**
   * 当前入口状态
   */
  state?: VDSessionState;
}

/**
 * 详细会话信息
 */
export interface VDSessionDetail extends VDSessionCore {
  user: VDUser;
}

declare module 'iron-session' {
  interface IronSessionData {
    content?: VDSessionCore;
  }
}
