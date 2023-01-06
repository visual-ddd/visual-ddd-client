import { BaseEditorModelOptions, BuiltinShapeName } from '@/lib/editor';

import { DomainObjectName } from '../domain-design/dsl';
import { DomainEditorModel } from '../domain-design/model';

/**
 * 模型构造
 * @param options
 * @returns
 */
export function createQueryEditorModel(options: Omit<BaseEditorModelOptions, 'shapeList' | 'whitelist' | 'scopeId'>) {
  const shapeList = [DomainObjectName.DTO, DomainObjectName.Rule, BuiltinShapeName.Activity, BuiltinShapeName.Comment];

  const whitelist = shapeList.concat([BuiltinShapeName.Edge]);
  return new DomainEditorModel({ ...options, scopeId: 'query', shapeList, whitelist, activeScope: false });
}
