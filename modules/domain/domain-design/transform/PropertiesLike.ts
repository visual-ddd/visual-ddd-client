import { cloneDeep } from '@wakeapp/utils';

import {
  createCommand,
  createDTO,
  createEntity,
  createEntityIdProperty,
  createQuery,
  createValueObject,
} from '../dsl/factory';
import type { CommandDSL, DTODSL, EntityDSL, PropertiesLikeDSL, QueryDSL, ValueObjectDSL } from '../dsl/dsl';

import { Transform } from './Transform';

export class PropertiesLike<T extends PropertiesLikeDSL> extends Transform<T> {
  clone() {
    const clone = cloneDeep(this.current);

    this.regenerateUUID(clone);

    this.regenerateUUIDList(clone.properties);

    return clone;
  }

  toValueObject(): ValueObjectDSL {
    const valueObject = createValueObject();
    this.mergeBaseInfo(valueObject);

    return valueObject;
  }

  toDTO(): DTODSL {
    const dto = createDTO();
    this.mergeBaseInfo(dto);

    return dto;
  }

  toEntity(): EntityDSL {
    const entity = createEntity();
    this.mergeBaseInfo(entity);

    // 设置 id
    const id = this.getEntityId();
    if (id) {
      entity.id = id;
    } else {
      const idProperty = createEntityIdProperty();
      entity.properties.unshift(idProperty);
      entity.id = idProperty.uuid;
    }

    return entity;
  }

  toQuery(): QueryDSL {
    const query = createQuery();
    this.mergeBaseInfo(query);

    return query;
  }

  toCommand(): CommandDSL {
    const command = createCommand();
    this.mergeBaseInfo(command);

    return command;
  }

  protected getEntityId() {
    // 设置 id
    if (this.current.properties.length) {
      const id = this.current.properties.find(i => i.name.toLowerCase().includes('id')) ?? this.current.properties[0];
      return id.uuid;
    }
  }

  /**
   * 合并基础信息
   * @param target
   * @returns
   */
  private mergeBaseInfo(target: PropertiesLikeDSL) {
    const clone = this.clone();

    const { properties, name, title, description, meta } = clone;
    Object.assign(target, {
      properties,
      name,
      title,
      description,
      meta,
    });

    return target;
  }
}
