import type { UbiquitousLanguageItem } from '@/modules/domain/ubiquitous-language-design/types';

export type { UbiquitousLanguageItem } from '@/modules/domain/ubiquitous-language-design/types';

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

  /**
   * 是否可选，比如 Java 场景，生成代码会携带 @Nullable 注解，默认为 false
   */
  optional?: boolean;
}

/**
 * 方法参数定义
 */
export interface ParameterDSL extends NameDSL {
  /**
   * 参数
   */
  type: TypeDSL;

  /**
   * 是否可选，比如 Java 场景，生成代码会携带 @Nullable 注解，默认为 false
   */
  optional?: boolean;
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

  // 命令分类，小写，可选，会影响 java 包结构，如果未提供，则为 name
  category?: string;

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

/**
 * -----------------------------------------------------------------------------------------
 *
 * 数据对象模型
 *
 * -----------------------------------------------------------------------------------------
 */

export type DataPropertyType =
  | 'Boolean'
  | 'Text'
  | 'LongText'
  | 'Date'
  | 'DateTime'
  | 'Timestamp'
  | 'Integer'
  | 'Long'
  | 'Double'
  | 'Float'
  | 'Decimal'
  | 'String';

export interface DataPropertyDSL extends NameDSL {
  /**
   * 表字段名，默认为 name 的 snake_case 模式
   */
  propertyName?: string;

  /**
   * 数据类型
   */
  type: DataPropertyType;

  /**
   * 根据具体数据类型确定, Text, LongText 不支持
   */
  defaultValue?: any;

  /**
   * 不为空，默认false, 另外也会受主键影响
   */
  notNull?: boolean;

  /**
   *  是否自增，默认为 false
   */
  autoIncrement?: boolean;

  /**
   * 精度, 默认 10, 最大为 65, 仅 Decimal 支持
   */
  precision?: number;

  /**
   * 小数位, 默认 0,仅 Decimal 支持
   */
  scale?: number;

  /**
   * 长度修饰符 默认为 0, 仅 String 类型有效
   */
  length?: number;
}

export type DataIndexType = 'Normal' | 'Unique' | 'Primary' | 'FullText';

export type DataIndexMethod = 'BTREE' | 'HASH';

export interface DataIndexDSL extends NameDSL {
  /**
   * 默认为 Normal
   */
  type?: DataIndexType;

  /**
   * 索引栏位，通常以数据对象的属性名称
   */
  properties: string[];

  /**
   * 默认为BTREE
   */
  method?: DataIndexMethod;
}

/**
 * 数据对象
 */
export interface DataObjectDSL extends NameDSL {
  /**
   * 表字段名，默认为 name 的 snake_case 模式
   */
  tableName?: string;

  /**
   * 字段
   */
  properties: DataPropertyDSL[];

  /**
   * 索引，默认为 []
   */
  indexes?: DataIndexDSL[];
}

/**
 * 数据对象引用关系描述
 */
export interface DataObjectReferenceDSL {
  /**
   * 来源名称
   */
  source: string;

  /**
   * 来源 id
   */
  sourceId: string;

  targets: Array<{
    // 目标表
    target: string;

    // 目标表 id
    targetId: string;

    // 关联关系
    cardinality: 'OneToOne' | 'OneToMany' | 'ManyToMany' | 'ManyToOne';

    // 字段映射
    mapper: Array<{
      sourceField: string;
      targetField: string;
    }>;
  }>;
}

/**
 * 数据模型
 */
export interface DataModelDSL {
  /**
   * 数据对象
   */
  dataObjects: DataObjectDSL[];

  /**
   * 引用关系
   */
  references: DataObjectReferenceDSL[];
}

/**
 * -----------------------------------------------------------------------------------------
 *
 * 对象映射模型
 *
 * -----------------------------------------------------------------------------------------
 */

/**
 * 对象映射
 */
export namespace ObjectMapper {
  export enum ObjectType {
    Entity = 'entity',
    ValueObject = 'valueObject',
    DTO = 'dto',
    DataObject = 'dataObject',
  }

  export interface ObjectReference {
    /**
     * 类名
     */
    name: string;

    /**
     * 类 id
     */
    id: string;

    /**
     * 对象类型
     */
    type: ObjectType;

    /**
     * 对于实体、值对象等领域对象 parent 为聚合的标识符
     * dto、dataObject 则为空
     */
    parent?: string;
  }
  export type ObjectFieldMapper = {
    // 来源字段
    sourceField: string;
    sourceFieldId: string;

    // 目标字段
    targetField: string;
    targetFieldId: string;
  };

  /**
   * 结构对象映射
   */
  export interface ObjectMapperDSL extends NameDSL {
    /**
     * 来源对象, 通常为实体或值对象、DTO
     */
    source: ObjectReference;

    /**
     * 目标对象, 通常为数据对象
     */
    target: ObjectReference;

    /**
     * 字段映射
     */
    mapper: ObjectFieldMapper[];
  }

  export interface ObjectMapperModel {
    mappers: ObjectMapperDSL[];
  }
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

  /**
   * 数据模型
   */
  dataModel: DataModelDSL;

  /**
   * 对象映射
   */
  objectMapper: ObjectMapper.ObjectMapperModel;

  /**
   * 统一语言
   */
  ubiquitousLanguage?: UbiquitousLanguageItem[];

  /**
   * 产品愿景
   */
  vision?: string;
}
