import type { EditorContextMenuItem, CopyPayload } from '@/lib/editor';
import type { Node } from '@antv/x6';

import { CommandDSL, DTODSL, EntityDSL, NameDSL, QueryDSL, ValueObjectDSL } from '../domain-design/dsl/dsl';
import { DomainObjectName, DomainObjectReadableName } from '../domain-design/dsl/constants';
import { DataObjectName, DataObjectReadableName } from '../data-design/dsl/constants';

import { Command } from './Command';
import { Query } from './Query';
import { DTO } from './DTO';
import { Entity } from './Entity';
import { ValueObject } from './ValueObject';
import { IDomainObjectTransform } from './Transform';

export type { IDomainObjectTransform } from './Transform';

export type DomainObjectTransformable =
  | DomainObjectName.Command
  | DomainObjectName.Query
  | DomainObjectName.DTO
  | DomainObjectName.Entity
  | DomainObjectName.ValueObject;

export type DomainObjectTransformTarget = DomainObjectTransformable | DataObjectName.DataObject;

/**
 * 创建领域对象转换器
 * @param type
 * @param value
 */
export function createDomainObjectTransform(type: DomainObjectName.Command, value: CommandDSL): IDomainObjectTransform;
export function createDomainObjectTransform(type: DomainObjectName.Query, value: QueryDSL): IDomainObjectTransform;
export function createDomainObjectTransform(type: DomainObjectName.DTO, value: DTODSL): IDomainObjectTransform;
export function createDomainObjectTransform(type: DomainObjectName.Entity, value: EntityDSL): IDomainObjectTransform;
export function createDomainObjectTransform(
  type: DomainObjectName.ValueObject,
  value: ValueObjectDSL
): IDomainObjectTransform;
export function createDomainObjectTransform(type: DomainObjectTransformable, value: NameDSL): IDomainObjectTransform {
  switch (type) {
    case DomainObjectName.Command:
      return new Command(value as CommandDSL);
    case DomainObjectName.Query:
      return new Query(value as QueryDSL);
    case DomainObjectName.DTO:
      return new DTO(value as DTODSL);
    case DomainObjectName.Entity:
      return new Entity(value as EntityDSL);
    case DomainObjectName.ValueObject:
      return new ValueObject(value as ValueObjectDSL);
    default:
      throw new Error(`不支持的领域对象类型: ${type}`);
  }
}

export const TRANSFORM_TARGET: [DomainObjectTransformTarget, keyof IDomainObjectTransform][] = [
  [DomainObjectName.Command, 'toCommand'],
  [DomainObjectName.Query, 'toQuery'],
  [DomainObjectName.DTO, 'toDTO'],
  [DomainObjectName.Entity, 'toEntity'],
  [DomainObjectName.ValueObject, 'toValueObject'],
  [DataObjectName.DataObject, 'toDataObject'],
];

const DOMAIN_OBJECT_TRANSFORM_TARGET_READABLE_NAME: Record<DomainObjectTransformTarget, string> = {
  ...DomainObjectReadableName,
  ...DataObjectReadableName,
};

/**
 * 创建右键菜单
 * @param type
 * @returns
 */
export function createCopyAsMenu(type: DomainObjectTransformable): EditorContextMenuItem {
  return {
    key: 'transform',
    label: '复制为',
    children: TRANSFORM_TARGET.map(([name, method]) => {
      return {
        key: name,
        label: DOMAIN_OBJECT_TRANSFORM_TARGET_READABLE_NAME[name],
        handler: context => {
          const { model, cell } = context.target!;
          const transform = createDomainObjectTransform(type as any, model.properties as any);
          const dsl = transform[method]();

          const payload: CopyPayload = {
            id: dsl.uuid,
            type: 'node',
            size: (cell as Node).getSize(),
            position: { x: 0, y: 0 },
            properties: {
              ...dsl,
              __node_name__: name,
              __node_type__: 'node',
            },
          };

          context.canvasModel.handleCopyPayloads([payload]);
        },
      };
    }),
  };
}
