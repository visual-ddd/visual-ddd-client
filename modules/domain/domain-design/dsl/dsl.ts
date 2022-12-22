/**
 * 核心元数据
 */
export interface NameDSL {
  /**
   * 自动生成的唯一标识符
   */
  uuid: string;

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
 * 类型应用的表示
 * TODO: 详细定义, 前期用户手动输入，辅助 AutoComplement, 执行 AST 验证
 * 一个巧妙的办法是转换为函数调用语法，或者直接写一个 lisp AST 解析器
 * https://bernsteinbear.com/blog/lisp/08_asts/
 * 基础类型: String, Integer, Long, Double, Float, Date, Boolean, BigDecimal, Char, Byte, Short
 * 集合类型：List<T>, Set<T>, Map<K, V>
 * 对象类型：
 */
export type TypeDSL = string;

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
  classMethods?: MethodDSL[];
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
   * 声明实体 id 的属性名称
   */
  id: string;
}
