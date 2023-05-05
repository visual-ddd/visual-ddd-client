import type {
  BusinessDomainDSL,
  AggregateDSL,
  NameDSL,
  PropertyDSL,
  BaseType,
  ReferenceTypeDSL,
  ReferenceTypeId,
  TypeDSL,
  ReferenceTypeName,
} from '@/modules/domain/api/dsl/interface';
import { NoopArray } from '@wakeapp/utils';
import memoize from 'lodash/memoize';

const REF_ID_REG = /\[[^\[\]]+\]/gm;

export function extraReferenceId(type: string): ReferenceTypeId[] {
  const matched = type.match(REF_ID_REG);
  return ((matched ?? NoopArray) as ReferenceTypeDSL[]).map(i => i.slice(1, -1).split(':')[1]);
}

export enum ObjectType {
  Command = 'Command',
  Query = 'Query',
  Object = 'Object',
  Enum = 'Enum',
}

export interface ObjectDSL extends NameDSL {
  /**
   * 对象类型
   */
  type: ObjectType;

  /**
   * 属性
   */
  properties?: PropertyDSL[];

  /**
   * 返回值, 仅命令和请求有
   */
  result?: TypeDSL;
}

/**
 * 从 dsl 中提取命令和查询, 以及引用对象
 * @param dsl
 * @returns
 */
export function extraApi(dsl: BusinessDomainDSL) {
  const commands: ObjectDSL[] = [];
  const queries: ObjectDSL[] = [];
  const references: Record<ReferenceTypeId, ObjectDSL> = {};

  /**
   * 在聚合中查找对象
   * @param id
   * @param aggregate
   * @returns
   */
  const findObjectInAggregate = memoize(
    (id: string, aggregate: AggregateDSL): ObjectDSL | undefined => {
      const { root, entities, enums, valueObjects } = aggregate;
      if (aggregate.root.uuid === id) {
        return {
          ...root,
          type: ObjectType.Object,
        };
      }

      const entity = entities?.find(i => i.uuid === id);
      if (entity) {
        return {
          ...entity,
          type: ObjectType.Object,
        };
      }

      const valueObject = valueObjects?.find(i => i.uuid === id);
      if (valueObject) {
        return {
          ...valueObject,
          type: ObjectType.Object,
        };
      }

      const enumItem = enums?.find(i => i.uuid === id);
      if (enumItem) {
        const type: BaseType = enumItem.baseType === 'number' ? 'Integer' : 'String';
        return {
          ...enumItem,
          type: ObjectType.Enum,
          properties: enumItem.members.map(i => ({
            ...i,
            type,
            title: `${i.code}${i.title && ': ' + i.title}`,
          })),
        };
      }
    },
    (id, aggregate) => `${id}-${aggregate.uuid}`
  );

  const findObjectInQuery = memoize((id: string) => {
    const ref = dsl.queryModel.dtos.find(i => i.uuid === id);

    if (ref) {
      return {
        ...ref,
        type: ObjectType.Object,
      };
    }
  });

  /**
   * 从对象中分析引用
   * @param object
   * @param referenceIdSet
   */
  const detectReferencesFromObject = (object: ObjectDSL, referenceIdSet: Set<string>) => {
    // 属性
    for (const property of object.properties ?? NoopArray) {
      if (property.type) {
        const referenceIds = extraReferenceId(property.type);

        if (referenceIds.length) {
          referenceIds.forEach(i => referenceIdSet.add(i));
        }
      }
    }

    // 返回值
    if (object.result) {
      const referenceIds = extraReferenceId(object.result);
      if (referenceIds.length) {
        referenceIds.forEach(i => referenceIdSet.add(i));
      }
    }
  };

  const collectionReference = (refId: string, finder: (refId: string) => ObjectDSL | undefined) => {
    if (references[refId]) {
      return;
    }

    const ref = finder(refId);

    if (ref == null) {
      throw new Error(`Reference object not found: ${refId}`);
    }

    references[refId] = ref;

    // 递归查找引用对象
    const deps = new Set<string>();
    detectReferencesFromObject(ref, deps);

    if (deps.size) {
      for (const dep of deps) {
        collectionReference(dep, finder);
      }
    }
  };

  // 命令提取
  dsl.domainModel.aggregates.forEach(aggregation => {
    commands.push(...aggregation.commands.map(i => ({ ...i, result: i.return?.type, type: ObjectType.Command })));

    const referenceIdSet = new Set<string>();

    // 分析引用关系
    for (const command of commands) {
      detectReferencesFromObject(command, referenceIdSet);
    }

    // 查找和添加引用对象
    for (const refId of referenceIdSet) {
      collectionReference(refId, id => findObjectInAggregate(id, aggregation));
    }
  });

  // 查询提取
  {
    const referenceIdSet = new Set<string>();
    queries.push(
      ...dsl.queryModel.queries.map(query => ({
        type: ObjectType.Query,
        result: query.return.type,
        ...query,
        title: query.pagination ? query.title + ' (分页)' : query.title,
      }))
    );

    for (const query of queries) {
      detectReferencesFromObject(query, referenceIdSet);
    }

    // 查找和添加引用对象
    for (const refId of referenceIdSet) {
      collectionReference(refId, findObjectInQuery);
    }
  }

  return {
    commands,
    queries,
    references,
  };
}

export function parseReference(refType: ReferenceTypeDSL) {
  return refType.slice(1, -1).split(':') as [ReferenceTypeName, ReferenceTypeId];
}

export function parseType<T>(type: string, transform: (name: string, id: string) => T): (T | string)[] {
  const list: (string | T)[] = [];

  let current = '';
  let starting = 0;

  for (const char of type) {
    if (char === '[') {
      list.push(current);
      current = char;
      starting++;
    } else if (char === ']') {
      if (!starting) {
        throw new Error('Invalid type: ' + type);
      }
      starting--;
      current += char;
      list.push(transform.apply(null, parseReference(current as ReferenceTypeDSL)));
      current = '';
    } else {
      current += char;
    }
  }

  if (starting) {
    throw new Error('Invalid type: ' + type);
  }

  if (current) {
    list.push(current);
  }

  return list.filter(Boolean);
}
