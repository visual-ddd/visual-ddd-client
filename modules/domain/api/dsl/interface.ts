/**
 * DSL 定义
 */
export type UUID = string;

/**
 * 核心元数据
 */
export interface IDDSL {
  /**
   * 自动生成的唯一标识符
   */
  uuid: UUID;
}

export interface MetaDSL {
  [key: string]: string;
}

export interface NameDSL extends IDDSL {
  /**
   * 唯一标识符, 用户输入
   */
  name: string;

  /**
   * 中文名称, 默认为 空字符串
   */
  title?: string;

  /**
   * 详细描述信息，默认为空字符串
   */
  description?: string;

  /**
   * 元数据，由开发者自行扩展,  DSL 本身不会关心其内容，DSL 消费者会关心
   */
  meta?: MetaDSL;
}

export interface BusinessDomainDSL {
  /**
   * 领域模型
   */
  domainModel: DomainModelDSL;

  /**
   * 查询模型
   */
  queryModel: QueryModelDSL;
}

export interface DomainModelDSL {
  /**
   * 聚合
   */
  aggregates: AggregateDSL[];
}

export interface QueryModelDSL {
  queries: QueryDSL[];
  dtos: DTODSL[];
}

/**
 * 访问控制
 */
export type AccessDSL = 'public' | 'private' | 'protected';

export type TypeDSL = string;

/**
 * 属性定义
 */
export interface PropertyDSL extends NameDSL {
  /**
   * 成员类型
   */
  type: TypeDSL;

  /**
   * 访问控制, 默认 public
   */
  access?: AccessDSL;
}

/**
 * 方法参数定义
 */
export interface ParameterDSL extends NameDSL {
  /**
   * 参数
   */
  type: TypeDSL;
}

export interface ReturnDSL {
  type: TypeDSL;
}

export interface MethodDefineDSL {
  description?: string;

  parameters: ParameterDSL[];
  return: ReturnDSL;
}

/**
 * 方法定义
 */
export interface MethodDSL extends NameDSL {
  /**
   * 访问控制, 默认 public
   */
  access?: AccessDSL;

  /**
   * 是否为抽象方法, 默认 false
   */
  abstract?: boolean;

  /**
   * 方法签名
   */
  signature: MethodDefineDSL | MethodDefineDSL[];
}

/**
 * 类定义
 */
export interface ClassDSL extends NameDSL {
  /**
   * 继承的类
   */
  extends?: string;

  /**
   * 扩展的接口
   */
  implements?: string[];

  /**
   * 是否为抽象类，默认为 false
   */
  abstract?: boolean;

  /**
   * 实例属性
   */
  properties?: PropertyDSL[];

  /**
   * 实例方法
   */
  methods?: MethodDSL[];

  /**
   * 类属性
   */
  classProperties?: PropertyDSL[];

  /**
   * 类方法，静态方法，默认为 []
   */
  classMethods?: MethodDSL[];
}

export interface EntityDSL extends ClassDSL {
  /**
   * 实体标识符
   */
  id: PropertyDSL;
}

export interface ValueObjectDSL extends ClassDSL {}

/**
 * 聚合描述
 */
export interface AggregateDSL extends NameDSL {
  root: EntityDSL;
  entities?: EntityDSL[];
  valueObjects?: ValueObjectDSL[];
  enums?: EnumDSL[];
  commands: CommandDSL[];
}

export interface EnumMemberDSL extends NameDSL {
  // 成员值
  code: number | string;
}

/**
 * 枚举
 */
export interface EnumDSL extends NameDSL {
  baseType: 'number' | 'string';
  members: EnumMemberDSL[];
}

export type SourceDSL =
  | {
      type: 'http';
    }
  | {
      type: 'rpc';
    }
  | {
      type: 'event';
      // 事件名
      value: string;
    }
  | {
      type: 'schedule';
      // cron 表达式
      value: string;
    };

// 绑定的仓储能力
type Repository = 'create' | 'modify' | 'remove';

// 领域事件
type DomainEvent = NameDSL & {
  // 属性
  properties: PropertyDSL[];
};

export type RuleDSL = NameDSL & {};

export interface CommandDSL extends NameDSL {
  // 命令的触发来源，默认为 http, rpc 两种类型， 优先使用query,command 上设定的
  source?: SourceDSL[];
  // 绑定的仓储能力
  repository: Repository;
  // 命令属性
  properties: PropertyDSL[];

  // 执行器, 默认 Handler 为 ·命令名称 + Handler· 连接起来的类， 有固定的实现逻辑

  // 事件, 即命令执行完成之后的触发的领域事件，默认为 []
  event?: DomainEvent;

  // 事件是否是需要发送  false 不发送，true 发送
  eventSendable?: boolean;

  // 规则， 默认为 []
  rules?: RuleDSL[];

  /**
   * 命令返回值，默认为 空。 备注：可能不符合 CQRS 严格定义
   */
  return?: ReturnDSL;
}

/**
 * DTO 定义
 */
export interface DTODSL extends ClassDSL {}

/**
 * 查询定义
 */
export interface QueryDSL extends NameDSL {
  /**
   * 查询触发来源
   */
  source: SourceDSL[];

  /**
   * 查询属性
   */
  properties: PropertyDSL[];

  /**
   * 分页返回
   */
  pagination: boolean;

  /**
   * 规则
   */
  rules?: RuleDSL[];

  /**
   * 查询返回值，默认为 空。
   */
  return: ReturnDSL;
}
