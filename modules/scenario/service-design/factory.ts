import { BaseEditorModelOptions, BuiltinShapeName } from '@/lib/editor';

import { DomainObjectName } from '@/modules/domain/domain-design/dsl';
import { DomainEditorModel } from '@/modules/domain/domain-design/model';

/**
 * 业务场景服务模型构造
 * @param options
 * @returns
 */
export function createServiceEditorModel(options: Omit<BaseEditorModelOptions, 'shapeList' | 'whitelist' | 'scopeId'>) {
  const shapeList = [
    DomainObjectName.Query,
    DomainObjectName.DTO,
    DomainObjectName.Rule,
    BuiltinShapeName.Activity,
    BuiltinShapeName.Comment,
  ];

  const whitelist = shapeList.concat([BuiltinShapeName.Edge]);
  return new DomainEditorModel({ ...options, scopeId: 'query', shapeList, whitelist, activeScope: false });
}
