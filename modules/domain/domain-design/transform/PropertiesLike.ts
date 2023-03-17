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
    this.mergeBaseInfo(query);

    return query;
  }

  toCommand(): CommandDSL {
    const command = createCommand();
    this.mergeBaseInfo(command);

    return command;
  }

  /**
   * 合并基础信息
   * @param target
   * @returns
   */
  protected mergeBaseInfo(target: PropertiesLikeDSL) {
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
