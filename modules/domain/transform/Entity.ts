import { MakeOptional } from '@/lib/core';

import type { DTODSL, EntityDSL, ValueObjectDSL } from '../domain-design/dsl/dsl';

import { ClassLike } from './ClassLike';

export class Entity extends ClassLike<EntityDSL> {
  override clone() {
    const id = this.current.id;
    const idPropertyIndex = this.current.properties.findIndex(property => property.uuid === id);

    const clone = super.clone();

    // 同步更新 id
    if (idPropertyIndex !== -1) {
      clone.id = clone.properties[idPropertyIndex].uuid;
    }

    return clone;
  }

  override toEntity(): EntityDSL {
    return this.clone();
  }

  override toValueObject(): ValueObjectDSL {
    const clone = this.clone() as MakeOptional<EntityDSL, 'id' | 'isAggregationRoot'>;

    delete clone.id;
    delete clone.isAggregationRoot;

    return clone;
  }

  override toDTO(): DTODSL {
    const dto = this.toValueObject();

    dto.methods = [];

    return dto;
  }
}
