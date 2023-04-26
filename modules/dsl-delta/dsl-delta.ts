import { objectDiff, markOP, isOPMarked } from './diff';
import { ApplicationDSL, Delta, DomainModelDSL, EntityDSL, NameDSL, ObjectMeta } from './protocol';
import { APPLICATION_DSL_META } from './meta';
import cloneDeep from 'lodash/cloneDeep';
import { NoopArray } from '@wakeapp/utils';

export function moveDetectForDomainModel(domain: DomainModelDSL) {
  const { aggregates } = domain;

  // 对象可能在聚合之间移动
  const objectsMarkDeleted: Map<string, NameDSL[]> = new Map();
  const objectsMarkNew: NameDSL[] = [];

  const markDeleted = (obj: NameDSL) => {
    const list = objectsMarkDeleted.get(obj.uuid);

    if (list) {
      list.push(obj);
    } else {
      objectsMarkDeleted.set(obj.uuid, [obj]);
    }
  };

  const checkList = (list: NameDSL[]) => {
    for (const i of list) {
      if (isOPMarked(i.__delta?.op, Delta.OP.OP_NEW)) {
        objectsMarkNew.push(i);
      } else if (isOPMarked(i.__delta?.op, Delta.OP.OP_DELETE)) {
        // 标记删除
        markDeleted(i);
      }
    }
  };

  for (const agg of aggregates) {
    // 聚合根
    if (isOPMarked(agg.root.__delta?.op, Delta.OP.OP_NEW)) {
      objectsMarkNew.push(agg.root);
    }

    const rootDelete = agg.__delta?.deltas.find(i => i.type === Delta.OP.OP_DELETE && i.key === 'root');
    if (rootDelete) {
      markDeleted((rootDelete as Delta.PropertyDelete).value as EntityDSL);
    }

    checkList(agg.entities || NoopArray);
    checkList(agg.valueObjects || NoopArray);
    checkList(agg.enums || NoopArray);
    checkList(agg.commands || NoopArray);
  }

  for (const obj of objectsMarkNew) {
    if (objectsMarkDeleted.has(obj.uuid)) {
      // 监听到移动
      obj.__delta!.op = markOP(obj.__delta!.op, Delta.OP.OP_MOVE);

      const deleted = objectsMarkDeleted.get(obj.uuid);
      deleted?.forEach(i => {
        i.__delta!.op = markOP(i.__delta!.op, Delta.OP.OP_MOVE);
      });
    }
  }
}

/**
 * 对象移动检测
 * @param dsl
 */
export function moveDetected(dsl: ApplicationDSL) {
  dsl.businessDomains.forEach(domain => {
    moveDetectForDomainModel(domain.domainModel);
  });
}

/**
 * 生成 DSL delta
 */
export function dslDelta(income: ApplicationDSL, old: ApplicationDSL) {
  const source = cloneDeep(income);
  const oldSource = cloneDeep(old);

  objectDiff(source, oldSource, APPLICATION_DSL_META as ObjectMeta<any>);

  moveDetected(source);

  return source;
}
