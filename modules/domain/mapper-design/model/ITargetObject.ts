import { NameDSL } from '@/modules/domain/domain-design/dsl';
import { DataObjectPropertyDSL } from '@/modules/domain/data-design/dsl';

/**
 * 目标对象
 * 通常为数据模型
 */
export interface ITargetObject extends NameDSL {
  properties: DataObjectPropertyDSL[];
}

export interface ITargetObjectGroup {
  key: string;
  label: string;
  list: ITargetObject[];
}
