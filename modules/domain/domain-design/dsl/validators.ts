import { FormValidatorContext } from '@/lib/editor';
import { getPaths } from '@/lib/utils';
import { get } from '@wakeapp/utils';
import memoize from 'lodash/memoize';

import { DomainObject, DomainEditorModel, DomainObjectFactory, IDomainObjectUnderAggregation } from '../model';
import { DomainObjectName } from './constants';
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

export const getPrefixPath = memoize(
  (fullPath: string, path: string) => {
    const index = fullPath.indexOf(path);
    if (index !== -1) {
      return fullPath.slice(0, index + path.length);
    }

    return fullPath;
  },
  (f, p) => {
    return `${f}:${p}`;
  }
);

/**
 * 检查是否在聚合内
 */
export function checkUnderAggregation(context: FormValidatorContext) {
  const object = getDomainObjectFromValidatorContext(context);

  if (!object) {
    return;
  }

  if (DomainObjectFactory.isUnderAggregation(object)) {
    if (object.aggregation == null) {
      throw new Error(`${object.objectTypeTitle} 必须关联到聚合`);
    }
  }
}

/**
 * 检查引用是否在同一个聚合内
 * @param context
 */
export function checkSameAggregationReference(context: FormValidatorContext) {
  // 先检查是否绑定了聚合
  try {
    checkUnderAggregation(context);
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
 * 检查聚合内领域对象的命名重复
 * @param value
 * @param context
 */
export function checkDomainObjectNameUnderAggregation(value: string, context: FormValidatorContext) {
  if (!value) {
    return null;
  }

  const { model } = context;
  const store = getDomainObjectStoreFromFormValidatorContext(context);
  const currentObject = store.getObjectById(model.id)!;

  const objects = store.getObjectsByName(value, [
    DomainObjectName.Entity,
    DomainObjectName.Enum,
    DomainObjectName.ValueObject,
  ]);
  const filtered = objects.filter(o => {
    // 相同对象: 跳过
    if (o.id === currentObject.id) {
      return false;
    }

    // 不同聚合，跳过
    if (o.parentId !== currentObject.parentId) {
      return false;
    }

    return true;
  });

  if (filtered.length) {
    throw new Error(`名称 ${value} 已重复`);
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
