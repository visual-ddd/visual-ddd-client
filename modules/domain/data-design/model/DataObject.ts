import { BaseNode } from '@/lib/editor';
import { UntitledInHumanReadable, UntitledInUpperCamelCase } from '../../domain-design/dsl/constants';
import { derive, makeAutoBindThis } from '@/lib/store';
import { IDisposable } from '@/lib/utils';

import { DataObjectStore } from './DataObjectStore';
import {
  DataObjectDSL,
  DataObjectPropertyDSL,
  DataObjectReference,
  DataObjectReferenceCardinality,
  DataObjectTypeName,
  objectTypeThatReferable,
} from '../dsl';
import { booleanPredicate, Disposer } from '@wakeapp/utils';
import { makeObservable, reaction } from 'mobx';

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
  reverseId: string;

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
export class DataObject implements IDisposable {
  readonly node: BaseNode;

  protected readonly store: DataObjectStore;
  private disposer = new Disposer();

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

  get name() {
    return this.dsl.name || UntitledInUpperCamelCase;
  }

  get title() {
    return this.dsl.title || UntitledInHumanReadable;
  }

  get readableTitle() {
    return `${this.title}(${this.name})`;
  }

  /**
   * 可引用的属性
   */
  @derive
  get referableProperties() {
    return this.dsl.properties.filter(i => objectTypeThatReferable(i.type.type));
  }

  /**
   * 主键属性
   */
  @derive
  get primaryKeyProperties() {
    return this.dsl.properties.filter(i => i.primaryKey);
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

  @derive
  get validReferences(): IDataObjectReference[] {
    return this.references.filter((i): i is IDataObjectReference => i.target != null && i.targetProperty != null);
  }

  /**
   * 依赖当前对象的对象列表
   */
  @derive
  get objectsDependOnMe(): DataObject[] {
    return this.store.objectsInArray
      .map(i => {
        if (i.id === this.id) {
          return null;
        }

        if (i.validReferences.some(j => j.target.id === this.id)) {
          return i;
        }
      })
      .filter(booleanPredicate);
  }

  /**
   * 关联的边
   * 在 store 层面还需要进一步合并
   */
  @derive
  get edges(): DataObjectEdgeDeclaration[] {
    const validReferences = this.validReferences;

    const groupByTarget: Map<DataObject, IDataObjectReference[]> = new Map();

    for (const ref of validReferences) {
      if (ref.target.id == this.id) {
        // 自我引用去掉
        continue;
      }

      if (groupByTarget.has(ref.target)) {
        groupByTarget.get(ref.target)?.push(ref);
      } else {
        groupByTarget.set(ref.target, [ref]);
      }
    }

    return Array.from(groupByTarget.entries()).map(([target, refs]) => {
      return {
        id: `${this.id}->${target.id}`,
        reverseId: `${target.id}->${this.id}`,
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

    makeObservable(this);
    makeAutoBindThis(this);

    this.disposer.push(
      reaction(
        () => {
          return [this.dsl.name, this.dsl.tableName];
        },
        () => {
          this.store.emitObjectNameChanged({ node: this.node, object: this });
        },
        { delay: 800, name: 'WATCH_DATA_OBJECT_NAME' }
      )
    );
  }

  dispose() {
    this.disposer.release();
  }

  /**
   * 根据 id 获取属性
   * @param id
   * @returns
   */
  getPropertyById(id: string) {
    return this.dsl.properties.find(i => {
      return i.uuid === id;
    });
  }

  /**
   * 获取主键的顺序
   * @param id
   */
  getPrimaryKeyIndex(id: string) {
    return this.primaryKeyProperties.findIndex(i => i.uuid === id);
  }
}
