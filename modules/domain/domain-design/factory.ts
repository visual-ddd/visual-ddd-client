import { BuiltinShapeName } from '@/lib/editor';

import { DomainObjectName } from './dsl';
import { DomainEditorModel, DomainEditorModelOptions } from './model';

/**
 * 模型构造
 * @param options
 * @returns
 */
export function createDomainEditorModel(
  options: Omit<DomainEditorModelOptions, 'shapeList' | 'whitelist' | 'scopeId'>
) {
  const shapeList = [
    DomainObjectName.Entity,
    DomainObjectName.ValueObject,
    DomainObjectName.Enum,
    DomainObjectName.Aggregation,
    DomainObjectName.Command,
    DomainObjectName.Rule,
    BuiltinShapeName.Activity,
    BuiltinShapeName.Comment,
  ];

  const whitelist = shapeList.concat([BuiltinShapeName.Edge]);
  return new DomainEditorModel({ ...options, scopeId: 'domain', shapeList, whitelist, activeScope: false });
}
