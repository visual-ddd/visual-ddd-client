/**
 * 数据模型 DSL 转换
 */
import * as DSL from './interface';
import * as ViewDSL from '@/modules/domain/data-design/dsl/dsl';
import { DataObjectName } from '@/modules/domain/data-design/dsl/constants';

import { transformMeta, transformString } from './domain-model';
import { Tree, BaseContainer, IContainer, Node } from './shared';

const DataObjectTypeName = ViewDSL.DataObjectTypeName;

export function transformType(
  type: ViewDSL.DataObjectTypeDSL,
  getReference: (objectId: string, propertyId: string) => ViewDSL.DataObjectPropertyDSL
): Record<string, any> {
  const typeName = type.type;

  switch (typeName) {
    case DataObjectTypeName.Date:
    case DataObjectTypeName.DateTime:
    case DataObjectTypeName.Timestamp:
      return {
        ...type,
        defaultValue: transformString(type.defaultValue),
      };
    case DataObjectTypeName.Reference:
      const refProperty = getReference(type.target!, type.targetProperty!);
      return {
        type: refProperty.type.type,
      };
    default:
      return type;
  }
}

export function transformProperty(
  property: ViewDSL.DataObjectPropertyDSL,
  getReference: (objectId: string, propertyId: string) => ViewDSL.DataObjectPropertyDSL
): DSL.DataPropertyDSL {
  const { uuid, title, name, description, meta, propertyName, primaryKey, notNull, type } = property;

  return {
    uuid,
    name,
    title,
    description,
    meta: transformMeta(meta),
    propertyName: transformString(propertyName),
    ...(transformType(type, getReference) as {
      type: DSL.DataPropertyType;
      defaultValue?: any;
      autoIncrement?: boolean;
      precision?: number;
      scale?: number;
      length?: number;
    }),
    notNull: primaryKey ? true : notNull,
  };
}

export function transformIndex(
  index: ViewDSL.DataObjectIndexDSL,
  getProperty: (id: string) => ViewDSL.DataObjectPropertyDSL
): DSL.DataIndexDSL {
  const { uuid, title, name, description, meta, type, method, properties } = index;

  return {
    uuid,
    name,
    title,
    description,
    meta: transformMeta(meta),
    type,
    method,
    properties: properties.map(i => getProperty(i).name),
  };
}

export function transformDataObjectReference(
  viewDSL: ViewDSL.DataObjectDSL,
  getObject: (objectId: string) => ViewDSL.DataObjectDSL,
  getReference: (objectId: string, propertyId: string) => ViewDSL.DataObjectPropertyDSL
): DSL.DataObjectReferenceDSL {
  const properties = viewDSL.properties;
  const targets: Map<
    // 目标对象 name
    string,
    {
      cardinality: 'OneToOne' | 'OneToMany' | 'ManyToMany' | 'ManyToOne';
      // 字段映射
      mapper: Map<string, string>;
    }
  > = new Map();

  for (const property of properties) {
    if (property.type.type !== DataObjectTypeName.Reference) {
      continue;
    }

    const { target, targetProperty, cardinality } = property.type as Required<ViewDSL.DataObjectReference>;

    // 自我引用去掉?
    if (target === viewDSL.uuid) {
      continue;
    }

    const targetObject = getObject(target);
    const targetPropertyInfo = getReference(target, targetProperty);
    const targetName = targetObject.name;

    let state = targets.get(targetName);

    if (state == null) {
      state = {
        cardinality,
        mapper: new Map(),
      };
      targets.set(targetName, state);
    }

    state.cardinality ??= cardinality;
    state.mapper.set(property.name, targetPropertyInfo.name);
  }

  return {
    source: viewDSL.name,
    targets: Array.from(targets.entries()).map(([target, { cardinality, mapper }]) => ({
      target,
      cardinality,
      mapper: Array.from(mapper.entries()).map(([sourceField, targetField]) => ({
        sourceField,
        targetField,
      })),
    })),
  };
}

export class DataObject extends Node<ViewDSL.DataObjectDSL> {
  toDSL(): DSL.DataObjectDSL {
    const { uuid, title, name, description, meta, properties, tableName, indexes } = this.properties;

    const transformedIndexes = indexes.map(i => transformIndex(i, this.getProperty));

    // 收集主键索引
    const primaryKeys = this.properties.properties.filter(i => i.primaryKey);
    if (primaryKeys.length) {
      transformedIndexes.push({
        uuid: `${uuid}-primary-key`,
        name: 'primaryKeys',
        type: 'Primary',
        properties: primaryKeys.map(i => i.name),
      });
    }

    return {
      uuid,
      title,
      name,
      description,
      meta: transformMeta(meta),
      tableName: transformString(tableName),
      properties: properties.map(i => transformProperty(i, this.getPropertyReference)),
      indexes: transformedIndexes,
    };
  }

  toReferenceDSL(): DSL.DataObjectReferenceDSL {
    return transformDataObjectReference(this.properties, this.getObject, this.getPropertyReference);
  }

  getObject = (id: string) => {
    return this.getReference(id) as ViewDSL.DataObjectDSL;
  };

  getProperty = (id: string): ViewDSL.DataObjectPropertyDSL => {
    return this.properties.properties.find(i => i.uuid === id)!;
  };

  getPropertyReference = (id: string, propertyId: string) => {
    const node = this.container.getNodeById(id) as unknown as DataObject;

    return node.properties.properties.find(i => i.uuid === propertyId)!;
  };
}

/**
 * 数据对象容器
 */
export class DataModelContainer extends BaseContainer implements IContainer {
  dataObjects: DataObject[] = [];

  /**
   * 收集所有有效的节点
   */
  nodesIndexByUUID: Map<string, DataObject> = new Map();

  constructor(tree: Record<string, Tree>) {
    super();

    this.traverse(tree);
  }

  toDSL(): DSL.DataModelDSL {
    return {
      dataObjects: this.dataObjects.map(i => i.toDSL()),
      references: this.dataObjects.map(i => i.toReferenceDSL()).filter(i => i.targets.length),
    };
  }

  getNodeById(id: string): Node<any> | undefined {
    return this.nodesIndexByUUID.get(id);
  }

  handle(node: Tree, tree: Record<string, Tree>): void {
    const type = node.properties.__node_name__;

    if (type !== DataObjectName.DataObject) {
      return;
    }

    const properties = node.properties as unknown as ViewDSL.DataObjectDSL;
    const object = new DataObject(properties.uuid, properties, this);
    this.dataObjects.push(object);
    this.nodesIndexByUUID.set(object.id, object);
  }
}
