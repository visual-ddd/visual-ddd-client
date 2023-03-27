export namespace IDomainServiceStore {
  export interface Item {
    id: string | number;
    name: string;
    label?: React.ReactNode;
  }
}

export interface IDomainServiceStore {
  /**
   * 获取业务域列表
   */
  getDomains(): Promise<IDomainServiceStore.Item[]>;

  /**
   * 获取版本列表
   * @param id
   */
  getDomainVersionList(domainId: string): Promise<IDomainServiceStore.Item[]>;

  /**
   * 获取业务域服务列表
   * 服务通常指的是指令或者查询
   * @param domainId
   * @param versionId
   */
  getDomainServiceList(domainId: string, versionId: string): Promise<IDomainServiceStore.Item[]>;
}
