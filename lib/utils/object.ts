import memoize from 'lodash/memoize';
import toPath from 'lodash/toPath';
import { get } from '@wakeapp/utils';

/**
 * 获取父路径
 */
export const getParentPath = memoize((path: string) => {
  return getPaths(path).slice(0, -1).join('.');
});

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
 * Returns an array of path segments.
 * If the path is a string, the array will be frozen in development mode.
 */
export const getPaths = memoize((path: string): readonly string[] => {
  if (process.env.NODE_ENV !== 'production') {
    return Object.freeze(toPath(path));
  }

  return toPath(path);
});

export function getPathLength(path: string) {
  return getPaths(path).length;
}

export function getPathSegmentByIndex(path: string, index: number) {
  return getPaths(path).at(index);
}

export const normalizePaths = memoize((path: string) => {
  return getPaths(path).join('.');
});

/**
 * 将最后一个路径替换为 *
 */
export const replaceLastPathToPattern = memoize(path => {
  const paths = getPaths(path).slice(0);
  paths[paths.length - 1] = '*';

  return paths.join('.');
});

/**
 * 移除指定路径的值
 *
 * @param target
 * @param key
 * @param remove
 * @returns
 */
export function unset(
  target: any,
  key: string,
  remove?: (object: any, key: string, defaultRemove: () => void) => boolean
): boolean {
  if (target == null) {
    return true;
  }

  if (typeof target !== 'object') {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`不能 unset 非对象值: `, target);
    }

    return true;
  }

  const path = getPaths(key);
  const parent = path.length > 1 ? get(target, path.slice(0, -1)) : target;
  const deleteKey = path[path.length - 1];

  if (parent == null) {
    return true;
  }

  const defaultRemove = () => {
    // 数组使用 splice 删除
    if (Array.isArray(parent)) {
      const index = parseInt(deleteKey);
      if (Number.isNaN(index)) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn(`unset 失败，当对象为数组时， deleteKey 必须为数字(现在为 ${deleteKey}) `, parent);
        }
        return false;
      } else if (index >= parent.length || index < 0) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn(`unset 失败，当对象为数组时， deleteKey(${index}) 超出数组长度范围 `, parent);
        }
        return false;
      }

      return !!parent.splice(index, 1).length;
    } else {
      return delete parent[deleteKey];
    }
  };
  if (remove) {
    // 自定义删除操作
    return remove(parent, deleteKey, defaultRemove);
  } else {
    return defaultRemove();
  }
}
