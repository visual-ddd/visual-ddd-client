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
  meta?: Record<string, string>;
}

/**
 * 标识符命名规则
 */
export type NameCase = 'CamelCase' | 'camelCase' | 'SNAKE_CASE';

export type BaseType =
  | 'String'
  | 'Integer'
  | 'Long'
  | 'Double'
  | 'Float'
  | 'Date'
  | 'Boolean'
  | 'BigDecimal'
  | 'Char'
  | 'Byte'
  | 'Short'
  | 'Void';

export const BaseTypeInArray: BaseType[] = [
  'String',
  'Integer',
  'Long',
  'Double',
  'Float',
  'Date',
  'Boolean',
  'BigDecimal',
  'Char',
  'Byte',
  'Short',
  'Void',
];

export type ContainerType = 'List' | 'Set' | 'Map';
export const ContainerTypeInArray: ContainerType[] = ['List', 'Set', 'Map'];

export enum TypeType {
  Base = 'base',
  Container = 'container',
  Reference = 'reference',
}

/**
 * 类型应用的表示
 * 基础类型: String, Integer, Long, Double, Float, Date, Boolean, BigDecimal, Char, Byte, Short, Void
 * 集合类型：List<T>, Set<T>, Map<K, V>
 * 引用类型：
 */
export type TypeDSL =
  | {
      // 基础类型
      type: TypeType.Base;
      name: BaseType;
    }
  | {
      // 容器数据
      type: TypeType.Container;
      name: ContainerType;

      /**
       * 泛型变量, 默认为 Void
       */
      params: { [key: string]: TypeDSL | undefined };
    }
  | {
      // 引用数据
      type: TypeType.Reference;
      /**
       * 引用 ID, 这个通常是不变的
       */
      referenceId: string;

      // 冗余字段，方便回显, 并不可靠
      name: string;
    };

/**
 * 访问控制
 */
export type AccessDSL = 'public' | 'private' | 'protected';

/**
 * 属性定义
 */
export interface PropertyDSL extends NameDSL {
  /**
   * 成员类型
   */
  type?: TypeDSL;

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
  type?: TypeDSL;
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
   * 方法参数
   */
  parameters: ParameterDSL[];

  /**
   * 方法返回值，当为空时相当于 void
   * return 是关键字，所以这里使用 result
   */
  result?: TypeDSL;
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
  properties: PropertyDSL[];

  /**
   * 实例方法
   */
  methods: MethodDSL[];

  /**
   * 类属性
   */
  classProperties: PropertyDSL[];

  /**
   * 类方法，静态方法，默认为 []
   */
  classMethods: MethodDSL[];
}

/**
 * 实体定义
 */
export interface EntityDSL extends ClassDSL {
  /**
   * 标记为聚合根
   */
  isAggregationRoot?: boolean;

  /**
   * 声明实体 id uuid
   */
  id: UUID;
}
