import { NoopArray, cloneDeep } from '@wakeapp/utils';
import diff from 'lodash/difference';
import isEqual from 'lodash/isEqual';

import { BaseNode } from '../BaseNode';
import { NodeYMap } from './NodeYMap';

/**
 * 校对
 * @param node
 * @param map
 */
export function sync(node: BaseNode, map: NodeYMap) {
  const tasks: (() => void)[] = [];

  // 父节点比对
  if (node.parent?.id !== map.parent) {
    tasks.push(() => {
      console.debug(`sync parent: ${node.id} -> ${node.parent?.id}`);
      map.parent = node.parent?.id;
    });
  }

  if (Boolean(node.locked) !== Boolean(map.locked)) {
    tasks.push(() => {
      console.debug(`sync locked: ${node.id} -> ${node.locked}`);
      map.locked = node.locked;
    });
  }

  // 子节点比对
  {
    const sourceChildrenId = node.children?.map(c => c.id) ?? NoopArray;
    const targetChildrenId = Array.from(map.children?.keys() ?? NoopArray);
    const added = diff(sourceChildrenId, targetChildrenId);
    const removed = diff(targetChildrenId, sourceChildrenId);

    if (added.length) {
      tasks.push(() => {
        for (const child of added) {
          console.debug(`sync addChild: ${node.id} -> ${child}`);
          map.addChild(child);
        }
      });
    }

    if (removed.length) {
      tasks.push(() => {
        for (const child of removed) {
          console.debug(`sync removeChild: ${node.id} -> ${child}`);
          map.removeChild(child);
        }
      });
    }
  }

  // 属性比对
  {
    const sourceKeys = Object.keys(node.properties);
    const targetKeys = Array.from(map.properties?.keys() ?? NoopArray);

    for (const key of sourceKeys) {
      const sourceValue = node.properties[key];
      const targetValue = map.properties.get(key);

      if (!isEqual(sourceValue, targetValue)) {
        tasks.push(() => {
          console.debug(`sync updateProperty: ${node.id} -> ${key}`);
          map.updateProperty(key, cloneDeep(sourceValue));
        });
      }
    }

    const removed = diff(targetKeys, sourceKeys).filter(i => !i.startsWith('__'));
    if (removed.length) {
      tasks.push(() => {
        for (const key of removed) {
          console.debug(`sync deleteProperty: ${node.id} -> ${key}`);
          map.deleteProperty(key);
        }
      });
    }
  }

  return tasks;
}
