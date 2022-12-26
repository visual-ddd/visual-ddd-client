import { NameDSL, RelationShipDSL } from '../dsl';
import { DomainObject } from './DomainObject';

export interface IEdgeDeclaration {
  id: string;
  source: string;
  target: string;

  sourceObject: DomainObject<NameDSL>;
  targetObject: DomainObject<NameDSL>;

  /**
   * 对象关系
   * https://www.cnblogs.com/zhongj/p/11169780.html
   *
   * dependency 依赖关系, 在Java中，类A当中使用了类B，其中类B是作为类A的**方法参数**、方法中的局部变量、返回值、或者静态方法调用
   * association 关联关系、作为成员强依赖时
   * aggregation 聚合
   * composition 组合(统一生命周期的整体和部分的关系)
   */
  type: RelationShipDSL;
}
