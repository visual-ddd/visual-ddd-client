export enum DomainVersionStatus {
  UNPUBLISHED = 1,
  PUBLISHED = 2,
}

export interface DomainVersion {
  createBy: string;
  createTime: string;
  currentVersion: string;
  description: string;
  domainDesignId: number;
  graphDsl?: string;
  domainDesignDsl?: string;
  id: number;
  startVersion: string;
  state: DomainVersionStatus;
  updateBy: string;
  updateTime: string;
}

export interface DomainCreatePayload {
  identity: string;
  name: string;
  teamId: number;
  description?: string;
  startVersion: string;
}

export interface DomainUpdatePayload {
  id: number;
  name: string;
  description?: string;
}

export interface DomainSimple {
  createBy: string;
  createTime: string;
  description: string;
  id: number;

  /**
   * 标识符
   */
  identity: string;
  name: string;
  teamId: number;
  updateBy: string;
  updateTime: string;
}

export interface DomainDetail extends DomainSimple {
  domainDesignLatestVersion: DomainVersion;
}
