import type { FormValidatorContext } from '@/lib/editor';
import { getPaths } from '@/lib/utils';
import { get } from '@wakeapp/utils';

import {
  DomainObject,
  DomainObjectCommand,
  DomainEditorModel,
  DomainObjectFactory,
  IDomainObjectUnderAggregation,
} from '../model';
import { NameDSL } from './dsl';

/**
 * 从验证上下文中获取 DomainObjectStore
 */
export function getDomainObjectStoreFromFormValidatorContext(context: FormValidatorContext) {
  const { editorModel } = context;

  return (editorModel as DomainEditorModel).domainObjectStore;
}

/**
 * 从验证上下文中获取 DomainObject
 * @param context
 * @returns
 */
export function getDomainObjectFromValidatorContext(context: FormValidatorContext) {
  const { model } = context;
  const store = getDomainObjectStoreFromFormValidatorContext(context);

  return store.getObjectById(model.id);
}

/**
 * 检查是否在聚合内
 */
export function checkUnderPackage(context: FormValidatorContext, packageName: string = '聚合') {
  const object = getDomainObjectFromValidatorContext(context);

  if (!object) {
    return;
  }

  if (object.package == null) {
    throw new Error(`${object.objectTypeTitle} 必须关联到${packageName}`);
  }
}

/**
 * 检查引用是否在同一个聚合内
 * @param context
 */
export function checkSameAggregationReference(context: FormValidatorContext) {
  // 先检查是否绑定了聚合
  try {
    checkUnderPackage(context);
  } catch {
    return;
  }

  // 可能是命令、以及聚合内部的对象，比如实体、值对象、枚举
  const model = getDomainObjectFromValidatorContext(context) as DomainObject<NameDSL> & IDomainObjectUnderAggregation;
  const aggregation = model.aggregation!;

  const errors: DomainObject<NameDSL>[] = [];
  const checkDeps = (deps: DomainObject<NameDSL>[]) => {
    for (const dep of deps) {
      if (DomainObjectFactory.isUnderAggregation(dep)) {
        if (dep.aggregation !== aggregation) {
          errors.push(dep);
        }
      }
    }
  };

  checkDeps(model.associations);
  checkDeps(model.dependencies);

  if (errors.length) {
    throw new Error(
      `不能引用非同聚合的对象:\n${errors.map(i => `《${i.objectTypeTitle}》${i.readableTitle}`).join('\n')}`
    );
  }
}

/**
 * 不能引用聚合根
 * @param context
 */
export function checkAggregationRootReference(context: FormValidatorContext) {
  const model = getDomainObjectFromValidatorContext(context) as DomainObject<NameDSL>;

  const errors: Set<DomainObject<NameDSL>> = new Set();
  const checkDeps = (deps: DomainObject<NameDSL>[]) => {
    for (const dep of deps) {
      if (DomainObjectFactory.isAggregationRoot(dep)) {
        errors.add(dep);
      }
    }
  };

  checkDeps(model.associations);
  if (errors.size) {
    throw new Error(
      `不能引用聚合根:\n${Array.from(errors)
        .map(i => `《${i.objectTypeTitle}》${i.readableTitle}`)
        .join('\n')}`
    );
  }
}

/**
 * 检查聚合内领域对象的命名重复
 * @param value
 * @param context
 */
export function checkDomainObjectNameConflict(value: string, context: FormValidatorContext) {
  if (!value) {
    return null;
  }

  const model = getDomainObjectFromValidatorContext(context) as DomainObject<NameDSL>;

  for (const obj of model.objectInSameNameScope) {
    if (obj.name === value) {
      throw new Error(`名称 ${value} 已重复`);
    }
  }
}

/**
 * 检查画布内相同类型的对象是否存在冲突
 * @param value
 * @param context
 */
export function checkSameTypeObjectNameConflict(value: string, context: FormValidatorContext) {
  if (!value) {
    return null;
  }

  const store = getDomainObjectStoreFromFormValidatorContext(context);
  const model = getDomainObjectFromValidatorContext(context) as DomainObject<NameDSL>;

  const objects = store.getObjectsInType(model.constructor as typeof DomainObject);

  if (objects.filter(i => i.name === value).length > 1) {
    throw new Error(`名称 ${value} 已重复`);
  }
}

/**
 * 检查命令的分类是否重复
 * @param value
 * @param context
 * @returns
 */
export function checkCommandCategoryConflict(value: string, context: FormValidatorContext) {
  if (!value) {
    return;
  }

  const model = getDomainObjectFromValidatorContext(context) as DomainObjectCommand;

  for (const obj of model.objectsInSameScope) {
    if (obj.category && obj.category === value) {
      throw new Error(`分类在同一个聚合下，建议保持唯一, 这样可以更好地区分代码`);
    }
  }
}

export function checkReferenceError(context: FormValidatorContext) {
  const model = getDomainObjectFromValidatorContext(context) as DomainObject<NameDSL>;

  if (model.hasReferencesError) {
    throw new Error('请修复引用错误');
  }
}

/**
 * 检查属性名称是否重复
 * @param value
 * @param path 属性集合的路径
 * @param context
 * @returns
 */
export function checkPropertyName(value: string, path: string, context: FormValidatorContext) {
  if (!value) {
    return null;
  }
  const { model, rawRule } = context;
  const field = rawRule.fullField!;
  const dsl = model.properties;
  const containerPath = getPaths(path);
  const valuePath = getPaths(field).slice(containerPath.length + 1);
  const properties = get(dsl, containerPath);

  let count = 0;
  for (const item of properties) {
    const name = get(item, valuePath);
    if (name == value) {
      count++;
    }

    if (count > 1) {
      throw new Error(`名称 ${value} 已重复`);
    }
  }
}
