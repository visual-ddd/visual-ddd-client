import { BaseNode } from '@/lib/editor';
import { DataObjectStore } from './DataObjectStore';
import {
  DataObjectDSL,
  DataObjectPropertyDSL,
  DataObjectReference,
  DataObjectReferenceCardinality,
  DataObjectTypeName,
} from '../dsl';
import { derive } from '@/lib/store';

export interface DataObjectInject {
  node: BaseNode;
  store: DataObjectStore;
}

export interface IDataObjectLooseReference {
  property: DataObjectPropertyDSL<DataObjectReference>;
  target?: DataObject;
  targetProperty?: DataObjectPropertyDSL;
  cardinality?: DataObjectReferenceCardinality;
}

export interface IDataObjectReference {
  property: DataObjectPropertyDSL<DataObjectReference>;
  target: DataObject;
  targetProperty: DataObjectPropertyDSL;
  cardinality?: DataObjectReferenceCardinality;
}

export interface DataObjectEdgeDeclaration {
  id: string;
  source: string;
  target: string;

  sourceObject: DataObject;
  targetObject: DataObject;

  /**
   * 关联方式
   */
  type?: DataObjectReferenceCardinality;
}

/**
 * 数据对象
 */
export class DataObject {
  readonly node: BaseNode;

  protected readonly store: DataObjectStore;

  /**
   * 唯一 id
   */
  get id() {
    return this.node.id;
  }

  /**
   * DSL 数据
   */
  get dsl() {
    return this.node.properties as unknown as DataObjectDSL;
  }

  /**
   * 所有引用类型的属性
   */
  @derive
  get rawReferences(): DataObjectPropertyDSL<DataObjectReference>[] {
    return this.dsl.properties.filter(
      (i): i is DataObjectPropertyDSL<DataObjectReference> => i.type.type === DataObjectTypeName.Reference
    );
  }

  /**
   * 引用的对象、字段
   */
  @derive
  get references(): IDataObjectLooseReference[] {
    return this.rawReferences.map(i => {
      const noop = {
        property: i,
        target: undefined,
        targetProperty: undefined,
        cardinality: undefined,
      } satisfies IDataObjectLooseReference;

      if (i.type.target == null || i.type.targetProperty == null) {
        return noop;
      }

      const { target, targetProperty, cardinality } = i.type;
      const object = this.store.getObjectById(target);

      if (object == null) {
        return noop;
      }

      const property = object.getPropertyById(targetProperty);

      return {
        property: i,
        target: object,
        targetProperty: property,
        cardinality,
      };
    });
  }

  /**
   * 关联的边
   * 在 store 层面还需要进一步合并
   */
  @derive
  get edges(): DataObjectEdgeDeclaration[] {
    const validReferences = this.references.filter(
      (i): i is IDataObjectReference => i.target != null && i.targetProperty != null
    );

    const groupByTarget: Map<DataObject, IDataObjectReference[]> = new Map();

    for (const ref of validReferences) {
      if (groupByTarget.has(ref.target)) {
        groupByTarget.get(ref.target)?.push(ref);
      } else {
        groupByTarget.set(ref.target, [ref]);
      }
    }

    return Array.from(groupByTarget.entries()).map(([target, refs]) => {
      return {
        id: `${this.id}->${target.id}`,
        source: this.id,
        target: target.id,
        sourceObject: this,
        targetObject: target,
        type: refs.find(i => !!i.cardinality)?.cardinality,
      };
    });
  }

  constructor(inject: DataObjectInject) {
    const { node, store } = inject;

    this.node = node;
    this.store = store;
  }

  /**
   * 根据 id 获取属性
   * @param id
   * @returns
   */
  getPropertyById(id: string) {
    return this.dsl.properties.find(i => {
      i.uuid === id;
    });
  }
}
