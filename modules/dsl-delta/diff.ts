import isEqual from 'lodash/isEqual';
import get from 'lodash/get';
import set from 'lodash/set';
import { toArray } from '@/lib/utils';
import { ObjectMeta, Delta, ValueType } from './protocol';
import { NoopArray } from '@wakeapp/utils';

export function addObjectOp(value: number, OP: Delta.OP) {
  return value | OP;
}

/**
 * 原子值比对
 * @param key
 * @param income
 * @param old
 * @returns
 */
export function atomDiff(key: string, income: any, old: any): Delta.PropertyDelta | undefined {
  if (income === old || (income == null && old == null)) {
    // 未变更
    return;
  }

  if (income == null) {
    return { type: Delta.OP.OP_DELETE, key, value: old };
  }

  if (old == null) {
    return { type: Delta.OP.OP_NEW, key };
  }

  // 深比较
  if (!isEqual(income, old)) {
    return { type: Delta.OP.OP_UPDATE, key, oldValue: old };
  }
}

export function objectEqual(a: any, b: any) {
  if (a == null || b == null) {
    return false;
  }

  if (a === b) {
    return true;
  }

  return a.uuid === b.uuid;
}

export function getObjectId(a: any) {
  if (a == null) {
    throw new Error('object is null');
  }

  return get(a, 'uuid');
}

export function injectDelta(obj: object, delta: Delta.Delta) {
  Object.defineProperty(obj, '__delta', {
    value: delta,
    enumerable: true,
    configurable: false,
  });

  return obj;
}

/**
 * 对象数组比对
 * @param income 新的对象数组
 * @param old 旧的对象数组
 * @param objectMeta 成员对象元数据
 */
export function objectArrayDiff(
  income: any,
  old: any,
  objectMeta: ObjectMeta<any>
): { result: any[]; delta: Delta.Delta } {
  income = toArray(income) as any[];
  old = toArray(old) as any[];
  const result: any[] = [];

  let updated = false;

  for (let i = 0; i < income.length; i++) {
    const item = income[i];
    const compareIdx = old.findIndex((i: any) => objectEqual(i, item));

    if (compareIdx === -1) {
      // 新增
      result.push(
        injectDelta(item, {
          op: Delta.OP.OP_NEW,
          deltas: NoopArray,
        })
      );
      updated = true;
    } else {
      const [toCompare] = old.splice(compareIdx, 1, null);
      const delta = objectDiff(item, toCompare, objectMeta);

      if (delta && delta.op !== Delta.OP.OP_NONE) {
        result.push(injectDelta(item, delta));
        updated = true;
      } else {
        if (compareIdx !== i) {
          // 顺序变化
          updated = true;
        }
        result.push(item);
      }
    }
  }

  // 剩下的就是被删除的
  old = old.filter(Boolean);
  if (old.length > 0) {
    updated = true;
    for (const item of old) {
      result.push(
        injectDelta(item, {
          op: Delta.OP.OP_DELETE,
          deltas: NoopArray,
        })
      );
    }
  }

  return {
    delta: {
      op: updated ? Delta.OP.OP_UPDATE : Delta.OP.OP_NONE,
      deltas: NoopArray,
    },
    result,
  };
}

/**
 * 对象比对
 * @returns 返回当前对象的 OP
 */
export function objectDiff(income: any, old: any, meta: ObjectMeta<any>): Delta.Delta | undefined {
  if (typeof meta !== 'object') {
    throw new Error('Invalid meta: ' + JSON.stringify(meta));
  }

  const op = Delta.OP.OP_NONE;

  const deltas: Delta.PropertyDelta[] = [];

  const pushDelta = (delta?: Delta.PropertyDelta) => {
    if (delta) {
      deltas.push(delta);
    }
  };

  // 计算属性的变更
  for (const key in meta) {
    if (!meta.hasOwnProperty(key)) {
      continue;
    }

    const type = meta[key];
    const left = get(income, key);
    const right = get(old, key);

    if (type === ValueType.Never) {
      continue;
    }

    // 跳过都为空的情况
    if (left == null && right == null) {
      continue;
    }

    if (type === ValueType.Atom) {
      pushDelta(atomDiff(key, left, right));
      continue;
    }

    if (Array.isArray(type)) {
      // 对象数组
      if (type.length !== 1 || typeof type[0] !== 'object') {
        // meta 定义非法
        throw new Error('Invalid object array type: ' + JSON.stringify(type));
      }

      const delta = objectArrayDiff(left, right, (type as any[])[0]);
      if (delta.delta.op !== Delta.OP.OP_NONE) {
        // 已修改
        set(income, key, delta.result);
        pushDelta({
          type: Delta.OP.OP_UPDATE,
          key,
        });
      }
      continue;
    }

    if (typeof type === 'object') {
      // 对象比较
      if (left != null && right == null) {
        // 新增
        pushDelta({
          type: Delta.OP.OP_NEW,
          key,
        });
        injectDelta(left, {
          op: Delta.OP.OP_NEW,
          deltas: NoopArray,
        });
      } else if (left == null && right != null) {
        pushDelta({
          type: Delta.OP.OP_DELETE,
          key,
          value: right,
        });
        injectDelta(right, {
          op: Delta.OP.OP_DELETE,
          deltas: NoopArray,
        });
      } else if (getObjectId(left) !== getObjectId(right)) {
        // ID 不一样，完全变更
        // 先删除旧的属性，再新增新的属性
        pushDelta({
          type: Delta.OP.OP_DELETE,
          key,
          value: right,
        });
        injectDelta(right, {
          op: Delta.OP.OP_DELETE,
          deltas: NoopArray,
        });
        pushDelta({
          type: Delta.OP.OP_NEW,
          key,
        });
        injectDelta(left, {
          op: Delta.OP.OP_NEW,
          deltas: NoopArray,
        });
      } else {
        const delta = objectDiff(left as any, right, type as ObjectMeta<any>);
        if (delta && delta?.op !== Delta.OP.OP_NONE) {
          pushDelta({
            type: Delta.OP.OP_UPDATE,
            key,
          });
          injectDelta(left, delta);
        }
      }

      continue;
    }

    // 不会到这里
    throw new Error('Invalid object type: ' + JSON.stringify(type));
  }

  // 对象属性发生了变更
  if (deltas.length) {
    return {
      op: Delta.OP.OP_UPDATE,
      deltas,
    };
  }

  return {
    op,
    deltas,
  };
}
