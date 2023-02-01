import { BuiltinShapeName } from '@/lib/editor';
import { MapperObjectName } from './dsl';
import { MapperEditorModel, MapperEditorModelOptions } from './model';

/**
 * 模型构造
 * @param options
 * @returns
 */
export function createMapperEditorModel(
  options: Omit<MapperEditorModelOptions, 'shapeList' | 'whitelist' | 'scopeId'>
) {
  const shapeList = [MapperObjectName.MapperObject, BuiltinShapeName.Comment];
  const whitelist = shapeList;

  return new MapperEditorModel({ ...options, scopeId: 'mapper', shapeList, whitelist, activeScope: false });
}
