import * as ViewDSL from '@/modules/domain/mapper-design/dsl/dsl';
import { MapperObjectName } from '@/modules/domain/mapper-design/dsl/constants';

import * as DSL from './interface';
import { Tree, BaseContainer, IContainer, Node } from './shared';
import { Entity, transformMeta, ValueObject } from './domain-model';
import { DTO } from './query-model';
import { DataObject } from './data-model';
import { IObjectStore } from './IObjectStore';

export function getObjectType(instance: Entity | ValueObject | DTO | DataObject): DSL.ObjectMapper.ObjectType {
  if (instance instanceof Entity) {
    return DSL.ObjectMapper.ObjectType.Entity;
  } else if (instance instanceof ValueObject) {
    return DSL.ObjectMapper.ObjectType.ValueObject;
  } else if (instance instanceof DTO) {
    return DSL.ObjectMapper.ObjectType.DTO;
  } else if (instance instanceof DataObject) {
    return DSL.ObjectMapper.ObjectType.DataObject;
  } else {
    throw new Error(`未知的对象类型: ${(instance as Object).constructor.name}`);
  }
}

/**
 * 获取字段名
 * @param object
 * @param fieldId
 * @returns
 */
export function getFieldNameFromObject(object: Entity | ValueObject | DTO | DataObject, fieldId: string) {
  return (object.properties.properties as ViewDSL.NameDSL[]).find(i => i.uuid === fieldId)!.name;
}

/**
 * 映射对象
 */
export class MapperObject extends Node<ViewDSL.MapperObjectDSL> {
  toDSL(): DSL.ObjectMapper.ObjectMapperDSL {
    const { uuid, title, name, description, meta, source, target, mappers } = this.properties;
    const container = this.container as unknown as IObjectStore;
    const { object: sourceObject, parent: sourceParent } = container.getObjectById(source!.referenceId);
    const { object: targetObject, parent: targetParent } = container.getObjectById(target!.referenceId);

    return {
      uuid,
      title,
      name,
      description,
      meta: transformMeta(meta),
      source: {
        name: sourceObject.name,
        parent: sourceParent?.name,
        type: getObjectType(sourceObject),
      },
      target: {
        name: targetObject.name,
        parent: targetParent?.name,
        type: getObjectType(targetObject),
      },
      mapper: mappers.map(i => {
        const { source, target } = i;
        return {
          sourceField: getFieldNameFromObject(sourceObject, source!),
          targetField: getFieldNameFromObject(targetObject, target!),
        };
      }),
    };
  }
}

/**
 * 对象容器
 */
export class MapperModelContainer extends BaseContainer implements IContainer, IObjectStore {
  objectStore: IObjectStore;
  mappers: MapperObject[] = [];

  /**
   * 收集所有有效的节点
   */
  nodesIndexByUUID: Map<string, MapperObject> = new Map();

  constructor(tree: Record<string, Tree>, objectStore: IObjectStore) {
    super();

    this.objectStore = objectStore;
    this.traverse(tree);
  }

  toDSL(): DSL.ObjectMapper.ObjectMapperModel {
    return {
      mappers: this.mappers.map(i => i.toDSL()),
    };
  }

  getNodeById(id: string): Node<any> | undefined {
    return this.nodesIndexByUUID.get(id);
  }

  getObjectById = (
    id: string
  ): {
    object: Entity | ValueObject | DTO | DataObject;
    parent?: Node<ViewDSL.NameDSL> | undefined;
  } => {
    return this.objectStore.getObjectById(id);
  };

  handle(node: Tree, tree: Record<string, Tree>): void {
    const type = node.properties.__node_name__;

    if (type !== MapperObjectName.MapperObject) {
      return;
    }

    const properties = node.properties as unknown as ViewDSL.MapperObjectDSL;
    const object = new MapperObject(properties.uuid, properties, this);
    this.mappers.push(object);
    this.nodesIndexByUUID.set(object.id, object);
  }
}
