import type { IDDSL, NameDSL } from '@/modules/domain/domain-design/dsl';

export interface LaneDSL extends IDDSL {
  title: string;
  height: number;
}

export interface LanesDSL extends NameDSL {
  width: number;

  /**
   * 泳道列表
   */
  panes: LaneDSL[];
}

/**
 * 决策
 */
export interface DecisionDSL extends NameDSL {}

/**
 * 标签边
 */
export interface LabelEdgeDSL extends IDDSL {
  label: string;
}

/**
 * 注释节点
 */
export interface CommentDSL extends IDDSL {
  content: string;
}

// TODO: 支持外部团队接口
export enum ActivityBindingType {
  /**
   * 业务场景服务
   */
  ScenarioService = 'scenarioService',

  /**
   * 业务域服务
   */
  DomainService = 'domainService',

  /**
   * 外部服务
   */
  ExternalService = 'externalService',
}

/**
 * 业务场景接口
 */
export interface ActivityBindingScenarioService {
  type: ActivityBindingType.ScenarioService;
  serviceId?: string;
}

/**
 * 业务域接口
 */
export interface ActivityBindingDomainService {
  type: ActivityBindingType.DomainService;
  domainId?: string;
  versionId?: string;

  /**
   * 领域服务 ID
   */
  domainServiceId?: string | string[];
}

/**
 * 外部服务
 */
export interface ActivityBindingExternalService {
  type: ActivityBindingType.ExternalService;

  /**
   * 外部服务
   */
  serviceName?: string;

  /**
   * 外部服务描述
   */
  serviceDescription?: string;
}

export type ActivityBinding =
  | ActivityBindingScenarioService
  | ActivityBindingDomainService
  | ActivityBindingExternalService;

/**
 * 业务活动
 */
export interface ActivityDSL extends NameDSL {
  /**
   * 关联
   */
  binding?: ActivityBinding;
}
