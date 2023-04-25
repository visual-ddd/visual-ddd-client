/**
 * 协议设计
 */
import type { BusinessDomainDSL, NameDSL } from '@/modules/domain/api/dsl/interface';
import type { ScenarioDSL } from '@/modules/scenario/api/dsl/interface';

export type * from '@/modules/domain/api/dsl/interface';
export type * from '@/modules/scenario/api/dsl/interface';

export interface WithVersion {
  /**
   * 版本号
   */
  version: string;
}

/**
 * 业务域
 */
export interface NormalizedBusinessDomainDSL extends NameDSL, WithVersion, BusinessDomainDSL {}

/**
 * 业务场景
 */
export interface NormalizedScenarioDSL extends NameDSL, WithVersion, ScenarioDSL {}

/**
 * 完整的应用 DSL
 */
export interface ApplicationDSL extends NameDSL, WithVersion {
  /**
   * 业务域
   */
  businessDomains: NormalizedBusinessDomainDSL[];

  /**
   * 业务场景
   */
  businessScenarios: NormalizedScenarioDSL[];
}

/**
 * 对象 diff 协议
 */
export namespace Delta {
  /**
   * 对象标记类型
   */
  export enum OP {
    /**
     * 无任何操作
     */
    OP_NONE = 0,

    /**
     * 标记节点及其子节点为新增
     */
    OP_NEW = 1,

    /**
     * 标记移除
     */
    OP_DELETE = 1 << 1,

    /**
     * 标记变动。
     */
    OP_UPDATE = 1 << 2,

    // 扩展标记
    /**
     * 对于位移的对象，比如从一个容器移动到另一个容器，会被标记为 Move
     * 目前仅在业务域的领域建模中可能存在这种情况
     */
    OP_MOVE = 1 << 3,
  }

  export interface PropertyUpdate {
    type: OP.OP_UPDATE;
    /**
     * 变更的属性
     */
    key: string;

    /**
     * 旧的值, 只有原始值会携带 oldValue
     * 如果是引用类型，这里为空
     */
    oldValue?: any;
  }

  export interface PropertyNew {
    type: OP.OP_NEW;
    key: string;
  }

  /**
   * 属性删除
   */
  export interface PropertyDelete {
    type: OP.OP_DELETE;
    key: string;

    /**
     * 被删除的值或对象
     */
    value: any;
  }

  export type PropertyDelta = PropertyUpdate | PropertyNew | PropertyDelete;

  /**
   * 对象变更标记
   */
  export interface Delta {
    /**
     * OP 位
     */
    op: number;

    /**
     * 属性 Delta
     */
    deltas: PropertyDelta[];
  }
}

// 注入 delta 标记到 NameDSL
declare module '@/modules/domain/api/dsl/interface' {
  export interface NameDSL {
    /**
     * Delta 标记
     */
    __delta?: Delta.Delta;
  }
}

/**
 * 值类型
 */
export enum ValueType {
  /**
   * 原子类型
   */
  Atom,

  /**
   * 不处理
   */
  Never,
}

/**
 * 对象结构定义
 */
export type ObjectMeta<T> = T extends {}
  ? {
      [K in keyof T]: ValueType | ObjectMeta<T[K]> | [ObjectMeta<T[K]>];
    }
  : ValueType;
