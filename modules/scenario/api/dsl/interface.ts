import type { QueryModelDSL } from '@/modules/domain/api/dsl/interface';

export interface DomainDependencyDSL {
  // 团队 Id, 跨团队关联时需要
  teamId?: string;

  // 依赖业务域 ID
  domainId: string | number;

  // 业务域版本号 ID
  versionId: string;

  // 服务id, 查询或者指令的 uuid
  serviceId: string;
}

/**
 * 业务场景
 */
export interface ScenarioDSL {
  /**
   * 依赖的业务域服务
   */
  domainDependencies: DomainDependencyDSL[];

  /**
   * 业务场景服务，直接复用查询模型
   */
  serviceModel: QueryModelDSL;
}
