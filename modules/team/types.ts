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

/**
 * 业务场景创建参数
 */
export interface ScenarioCreatePayload extends DomainCreatePayload {}

export interface ScenarioUpdatePayload extends DomainUpdatePayload {}

export interface ScenarioVersion {
  businessSceneId: number;
  createBy: string;
  createTime: string;
  currentVersion: string;
  description: string;
  dsl: string;
  graphDsl: string;
  id: number;
  startVersion: string;
  state: number;
  updateBy: string;
  updateTime: string;
}

export interface ScenarioSimple extends DomainSimple {}

export interface ScenarioDetail extends ScenarioSimple {
  version: ScenarioVersion;
}

export interface ScenarioDetailPayload extends ScenarioSimple {
  businessSceneLatestVersion: ScenarioVersion;
}

export interface AppSimple {
  createBy: string;
  createTime: string;
  updateBy: string;
  updateTime: string;
  description: string;
  id: number;

  /**
   * 标识符
   */
  identity: string;
  name: string;
  packageName: string;
  teamId: number;
}

export interface AppCreatePayload {
  identity: string;
  name: string;
  teamId: number;
  packageName: string;
  description?: string;
  startVersion: string;
}

/**
 * 应用版本信息
 */
export interface AppVersion {
  applicationId: number;
  businessSceneVersionDTOList?: ScenarioVersion[];
  businessSceneVersionIds?: number[];
  createBy: string;
  createTime: string;
  currentVersion: string;
  description: string;
  domainDesignVersionDTOList?: DomainVersion[];
  domainDesignVersionIds?: number[];
  dsl?: string;
  id: number;
  startVersion: string;
  state: VersionStatus;
  updateBy: string;
  updateTime: string;
}

/**
 * 应用详情
 */
export interface AppDetail extends AppSimple {
  version: AppVersion;
}

export interface AppDetailPayload extends AppSimple {
  applicationLatestVersion: AppVersion;
}

export interface AppUpdatePayload {
  id: number;
  name: string;
  packageName: string;
  description?: string;
}
