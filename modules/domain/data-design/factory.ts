import { BaseEditorModelOptions, BuiltinShapeName } from '@/lib/editor';

import { DataObjectName } from './dsl';
import { DataObjectEditorModel } from './model';

/**
 * 模型构造
 * @param options
 * @returns
 */
export function createDataObjectEditorModel(
  options: Omit<BaseEditorModelOptions, 'shapeList' | 'whitelist' | 'scopeId'>
) {
  const shapeList = [DataObjectName.DataObject, BuiltinShapeName.Comment];

  const whitelist = shapeList;

  return new DataObjectEditorModel({ ...options, scopeId: 'data-object', shapeList, whitelist, activeScope: false });
}
