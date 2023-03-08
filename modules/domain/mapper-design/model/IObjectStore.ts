import { TypeDSL } from '../../domain-design/dsl/dsl';
import { ISourceObject, ISourceObjectGroup } from './ISourceObject';
import { ITargetObject, ITargetObjectGroup } from './ITargetObject';

export interface IObjectStore {
  /**
   * 来源对象列表
   */
  sourceObjectGroups: ISourceObjectGroup[];

  /**
   * 目标对象列表
   */
  targetObjectGroup: ITargetObjectGroup[];

  /**
   * 获取来源对象
   * @param id
   */
  getSourceObjectById(id: string): ISourceObject | undefined;

  /**
   * 获取目标对象
   * @param id
   */
  getTargetObjectById(id: string): ITargetObject | undefined;

  /**
   * 聚焦节点
   * @param id
   */
  focusObject(id: string): void;

  /**
   * 获取节点的类型, 比如 domain, query, data
   * @param id
   */
  getObjectType(id: string): { type: string; label: string } | undefined;

  /**
   * 获取指定对象底层的存储类型。主要用于枚举
   * 比如，枚举底层存储的类型是 number 或者 string
   * @param id
   */
  getReferenceStorageType(id: string): TypeDSL | undefined;
}
