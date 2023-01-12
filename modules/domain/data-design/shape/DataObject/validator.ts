import { FormValidatorContext } from '@/lib/editor';
import { getPaths } from '@/lib/utils';
import { DataObjectDSL, DataObjectTypeDSL } from '../../dsl';
import { DataObject, DataObjectEditorModel } from '../../model';

/**
 * 从验证上下文中获取 DataObjectStore
 */
export function getDataObjectStoreFromFormValidatorContext(context: FormValidatorContext) {
  const { editorModel } = context;

  return (editorModel as DataObjectEditorModel).dataObjectStore;
}

/**
 * 从验证上下文中获取 DataObject
 * @param context
 * @returns
 */
export function getDataObjectFromValidatorContext(context: FormValidatorContext): DataObject | undefined {
  const { model } = context;
  const store = getDataObjectStoreFromFormValidatorContext(context);

  return store.getObjectById(model.id);
}

/**
 * 检查命名冲突
 * @param value
 * @param context
 * @returns
 */
export function checkDataObjectNameConflict(
  value: string,
  context: FormValidatorContext,
  name: keyof DataObjectDSL = 'name',
  title = '名称'
) {
  const store = getDataObjectStoreFromFormValidatorContext(context);
  const object = getDataObjectFromValidatorContext(context);

  if (!object) {
    return;
  }

  for (const obj of store.objectsInArray) {
    if (obj.id === object.id) {
      continue;
    }

    if (value === obj.dsl[name]) {
      throw new Error(`${title} ${value} 已重复`);
    }
  }
}

/**
 * 检查引用
 * @param context
 */
export function checkReferenceError(context: FormValidatorContext) {
  const object = getDataObjectFromValidatorContext(context);

  if (!object) {
    return;
  }

  if (object.references.length !== object.validReferences.length) {
    throw new Error('请修复引用错误');
  }
}

export function getDataObjectType(context: FormValidatorContext) {
  const { rawRule, model } = context;
  const fields = rawRule.fullField!;
  const typePath = getPaths(fields).slice(0, -1).join('.');

  return model.getProperty(typePath) as DataObjectTypeDSL;
}
