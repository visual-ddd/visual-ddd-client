export interface IDomainServiceStore {
  /**
   * 获取业务域列表
   */
  getDomains(): Promise<Array<{ id: string; name: string }>>;

  /**
   * 获取版本列表
   * @param id
   */
  getDomainVersionList(domainId: string): Promise<Array<{ id: string; name: string }>>;

  /**
   * 获取业务域服务列表
   * 服务通常指的是指令或者查询
   * @param domainId
   * @param versionId
   */
  getDomainServiceList(domainId: string, versionId: string): Promise<Array<{ id: string; name: string }>>;
}
