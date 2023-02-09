export interface DomainVersion {
  createBy: string;
  createTime: string;
  currentVersion: string;
  description: string;
  domainDesignDsl: string;
  domainDesignId: number;
  graphDsl: string;
  id: number;
  startVersion: string;
  state: number;
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
