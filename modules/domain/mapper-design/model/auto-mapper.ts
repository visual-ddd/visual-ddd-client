import { booleanPredicate } from '@wakeapp/utils';
import Fuse from 'fuse.js';

import { createVoidClass } from '../../domain-design/dsl/factory';
import { TypeDSL } from '../../domain-design/dsl/dsl';
import { isCompatible } from '../dsl';
import type { ISourceObject } from './ISourceObject';
import type { ITargetObject } from './ITargetObject';

/**
 * 自动映射
 */
export function autoMapper(
  source: ISourceObject,
  target: ITargetObject,
  inject: {
    getReferenceStorageType: (id: string) => TypeDSL | undefined;
  }
): Record<string, string> {
  // 建立搜索索引
  const targetIndex = new Fuse(
    target.properties
      .map(i => {
        return i.name;
      })
      .filter(booleanPredicate)
  );

  // uuid -> uuid
  const results: Record<string, string> = {};
  const getTargetPropertyByName = (name: string) => {
    return target.properties.find(i => i.name === name);
  };

  for (const property of source.properties) {
    const name = property.name;
    const type = property.type || createVoidClass();

    if (!name) {
      continue;
    }

    const matched = targetIndex.search(name);

    for (const item of matched) {
      const targetName = item.item;
      const targetProperty = getTargetPropertyByName(targetName)!;
      if (isCompatible(type, targetProperty.type, inject)) {
        results[property.uuid] = targetProperty.uuid;
        break;
      }
    }
  }

  return results;
}
