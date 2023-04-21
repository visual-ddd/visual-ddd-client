import { FormValidatorContext } from '@/lib/editor';
import { getParentPath } from '@/lib/utils';
import { createBaseType } from '@/modules/domain/domain-design/dsl';
import { FieldMapperDSL, isCompatible } from '../../dsl';

import { Mapper, MapperEditorModel } from '../../model';

/**
 * 从验证上下文中获取 MapperStore
 */
export function getMapperStoreFromFormValidatorContext(context: FormValidatorContext) {
  const { editorModel } = context;

  return (editorModel as MapperEditorModel).mapperStore;
}

/**
 * 从验证上下文中获取 DataObject
 * @param context
 * @returns
 */
export function getMapperFromValidatorContext(context: FormValidatorContext): Mapper | undefined {
  const { model } = context;
  const store = getMapperStoreFromFormValidatorContext(context);

  return store.getMapperById(model.id);
}

/**
 * 检查命名冲突
 * @param value
 * @param context
 * @returns
 */
export function checkMapperNameConflict(value: string, context: FormValidatorContext) {
  const store = getMapperStoreFromFormValidatorContext(context);
  const object = getMapperFromValidatorContext(context);

  if (!object) {
    return;
  }

  for (const obj of store.mappersInArray) {
    if (obj.id === object.id) {
      continue;
    }

    if (value === obj.dsl.name) {
      throw new Error(`标识符 ${value} 已重复`);
    }
  }
}

export function checkSourceObject(context: FormValidatorContext) {
  const mapper = getMapperFromValidatorContext(context);

  if (!mapper) {
    return;
  }

  if (mapper.dsl.source == null) {
    throw new Error('源对象不能为空');
  }

  if (!mapper.sourceObject) {
    throw new Error('源对象未定义');
  }
}

export function checkSourceObjectMatch(context: FormValidatorContext) {
  const mapper = getMapperFromValidatorContext(context);

  if (!mapper || !mapper.sourceObject || !mapper.targetObject) {
    return;
  }

  // 未映射的字段
  const fields: string[] = [];
  for (const item of mapper.sourceFields) {
    if (!mapper.mappers.some(i => i.source === item.uuid)) {
      fields.push(item.name);
    }
  }

  if (fields.length > 0) {
    throw new Error(`请注意, 源对象这些字段未映射: ${fields.join(', ')}`);
  }
}

export function checkTargetObject(context: FormValidatorContext) {
  const mapper = getMapperFromValidatorContext(context);

  if (!mapper) {
    return;
  }

  if (mapper.dsl.target == null) {
    // required 已检查
    throw new Error('目标对象不能为空');
  }

  if (!mapper.targetObject) {
    throw new Error('目标对象未定义');
  }
}

function isMapperObjectValid(context: FormValidatorContext) {
  try {
    checkSourceObject(context);
    checkTargetObject(context);
    return true;
  } catch {
    // ignore
    return false;
  }
}

/**
 * 检查字段兼容性
 * @param context
 * @returns
 */
export function checkFieldCompatible(context: FormValidatorContext) {
  const store = getMapperStoreFromFormValidatorContext(context);
  const fullField = context.rawRule.fullField!;
  const mapperPath = getParentPath(fullField);
  const fieldMapper = context.model.getProperty(mapperPath) as FieldMapperDSL;

  const { source, target } = fieldMapper;

  if (source == null || target == null) {
    return;
  }

  const mapper = getMapperFromValidatorContext(context)!;
  const sourceField = mapper.getSourceFieldById(source);
  const targetField = mapper.getTargetFieldById(target);

  if (sourceField == null || targetField == null) {
    return;
  }

  // 类型兼容性检查
  if (
    !isCompatible(sourceField.type || createBaseType('Void'), targetField.type, {
      getReferenceStorageType: store.getReferenceStorageType.bind(store),
    })
  ) {
    throw new Error(`字段类型不兼容`);
  }
}

export function checkSourceField(value: string | undefined, context: FormValidatorContext) {
  if (!isMapperObjectValid(context)) {
    return;
  }

  if (value == null) {
    throw new Error('源字段未定义');
  }

  const mapper = getMapperFromValidatorContext(context)!;
  const sourceField = mapper.getSourceFieldById(value);

  if (sourceField == null) {
    throw new Error(`源字段不存在`);
  }
}

export function checkTargetField(value: string | undefined, context: FormValidatorContext) {
  if (!isMapperObjectValid(context)) {
    return;
  }

  if (value == null) {
    throw new Error('目标字段未定义');
  }

  const mapper = getMapperFromValidatorContext(context)!;
  const sourceField = mapper.getTargetFieldById(value);

  if (sourceField == null) {
    throw new Error(`目标字段不存在`);
  }

  checkFieldCompatible(context);
}

export function checkTargetObjectMatch(context: FormValidatorContext) {
  const mapper = getMapperFromValidatorContext(context);

  if (!mapper || !mapper.sourceObject || !mapper.targetObject) {
    return;
  }

  // 未映射的字段
  const fields: string[] = [];
  for (const item of mapper.targetFields) {
    if (!mapper.mappers.some(i => i.target === item.uuid)) {
      fields.push(item.name);
    }
  }

  if (fields.length > 0) {
    throw new Error(`请注意, 目标对象中这些字段未被映射: ${fields.join(', ')}`);
  }
}
