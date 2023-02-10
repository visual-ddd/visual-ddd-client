import { VersionStatus } from '@/lib/core';

export { VersionStatus };

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
  state: VersionStatus;
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

export interface DomainDetailPayload extends DomainSimple {
  domainDesignLatestVersion: DomainVersion;
}

export interface DomainDetail extends DomainSimple {
  version: DomainVersion;
}
