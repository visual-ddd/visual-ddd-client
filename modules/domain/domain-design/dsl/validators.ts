import { FormValidatorContext } from '@/lib/editor';
import { getPaths } from '@/lib/utils';
import { get } from '@wakeapp/utils';
import memoize from 'lodash/memoize';

import { DomainEditorModel } from '../model';
import { DomainObjectName } from './constants';

/**
 * 从验证上下文中获取 DomainObjectStore
 */
export function getDomainObjectStoreFromFormValidatorContext(context: FormValidatorContext) {
  const { editorModel } = context;

  return (editorModel as DomainEditorModel).domainObjectStore;
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
