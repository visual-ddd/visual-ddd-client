/**
 * 协议设计
 */
import type { BusinessDomainDSL, NameDSL } from '@/modules/domain/api/dsl/interface';
import type { ScenarioDSL } from '@/modules/scenario/api/dsl/interface';

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
   * 值类型
   */
  export enum ValueType {
    /**
     * 对象类型
     */
    Object,

    /**
     * 原子类型
     */
    Atom,
  }

  /**
   * 对象标记类型
   */
  export enum ObjectOP {
    /**
     * 标记节点及其子节点为新增
     */
    OP_NEW = 1,

    /**
     * 标记移除
     */
    OP_DELETE = 1 << 1,
    /**
     * 对于位移的对象，比如从一个容器移动到另一个容器，会被标记为 Move
     * 目前仅在业务域的领域建模中可能存在这种情况
     */
    OP_MOVE = 1 << 2,

    /**
     * 标记更新。
     * - 和 Dirty 的区别是 update 是节点本身发生了变更，而 dirty 是子节点发生了变更
     * - update 表示原子属性发生了变更
     */
    OP_UPDATE = 1 << 3,

    /**
     * 对于引用类型，如果子级发生的变更, 会被标记为 Dirty, 生成器可以自行决定是否需要往下处理
     */
    OP_DIRTY = 1 << 4,
  }

  /**
   * 属性标记
   */
  export enum PropertyOP {
    OP_DIRTY = 'dirty',
    OP_NEW = 'new',
    OP_DELETE = 'delete',
    OP_UPDATE = 'update',
  }

  export interface PropertyDirty {
    type: PropertyOP.OP_DIRTY;
    key: string;
  }

  export interface PropertyUpdate {
    type: PropertyOP.OP_UPDATE;
    /**
     * 变更的属性
     */
    key: string;

    /**
     * 旧的值
     */
    oldValue: any;
  }

  export interface PropertyNew {
    type: PropertyOP.OP_NEW;
    key: string;
  }

  /**
   * 属性删除
   */
  export interface PropertyDelete {
    type: PropertyOP.OP_DELETE;
    key: string;
    value: any;
  }

  export type PropertyDelta = PropertyDirty | PropertyUpdate | PropertyNew | PropertyDelete;

  export interface Delta {
    /**
     * ObjectOP 位
     */
    op: number;

    /**
     * 属性 Delta
     */
    deltas: PropertyDelta[];
  }
}
