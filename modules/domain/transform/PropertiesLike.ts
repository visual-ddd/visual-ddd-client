import { cloneDeep } from '@wakeapp/utils';

import {
  createCommand,
  createDTO,
  createEntity,
  createEntityIdProperty,
  createQuery,
  createValueObject,
} from '../domain-design/dsl/factory';
import type {
  CommandDSL,
  DTODSL,
  EntityDSL,
  NameDSL,
  PropertiesLikeDSL,
  QueryDSL,
  ValueObjectDSL,
} from '../domain-design/dsl/dsl';
import type { DataObjectDSL } from '../data-design/dsl/dsl';
import { createDataObjectDSL, createDataObjectPropertyDSL } from '../data-design/dsl/factory';

import { Transform } from './Transform';
import { transformTypeDSLToDataObjectTypeDSL } from '../generator';

export class PropertiesLike<T extends PropertiesLikeDSL> extends Transform<T> {
  clone() {
    const clone = cloneDeep(this.current);

    this.regenerateUUID(clone);

    this.regenerateUUIDList(clone.properties);

    return clone;
  }

  toValueObject(): ValueObjectDSL {
    const valueObject = createValueObject();
    this.mergeData(valueObject);

    return valueObject;
  }

  toDTO(): DTODSL {
    const dto = createDTO();
    this.mergeData(dto);

    return dto;
  }

  toEntity(): EntityDSL {
    const entity = createEntity();
    this.mergeData(entity);

    let idProperty = entity.properties.find(i => i.name.toLowerCase().includes('id')) ?? entity.properties[0];

    if (idProperty) {
      entity.id = idProperty.uuid;
    } else {
      idProperty = createEntityIdProperty();
      entity.properties.unshift(idProperty);
      entity.id = idProperty.uuid;
    }

    return entity;
  }

  toQuery(): QueryDSL {
    const query = createQuery();
    this.mergeData(query);

    return query;
  }

  toCommand(): CommandDSL {
    const command = createCommand();
    this.mergeData(command);

    return command;
  }

  toDataObject(): DataObjectDSL {
    const data = createDataObjectDSL();

    this.mergeBaseInfo(data);

    data.properties = [];

    // 转换属性
    const properties = this.cloneProperties();
    for (const prop of properties) {
      const type = prop.type && transformTypeDSLToDataObjectTypeDSL(prop.type);

      if (type == null) {
        continue;
      }

      const dataProp = createDataObjectPropertyDSL();
      // 合并基础信息
      this.mergeBaseInfo(dataProp, prop);
      dataProp.type = type;

      data.properties.push(dataProp);
    }

    return data;
  }

  protected mergeData(target: PropertiesLikeDSL) {
    this.mergeBaseInfo(target);
    this.mergeProperties(target);
  }

  /**
   * 合并基础信息
   * @param target
   * @returns
   */
  protected mergeBaseInfo(target: NameDSL, source: NameDSL = this.current) {
    const { name, title, description, meta } = source;
    Object.assign(target, {
      name,
      title,
      description,
      meta: cloneDeep(meta),
    });

    return target;
  }

  protected cloneProperties() {
    return this.regenerateUUIDList(cloneDeep(this.current.properties))!;
  }

  protected mergeProperties(target: PropertiesLikeDSL) {
    Object.assign(target, {
      properties: this.cloneProperties(),
    });
  }
}
