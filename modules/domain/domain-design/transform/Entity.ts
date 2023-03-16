import { MakeOptional } from '@/lib/core';
import type { DTODSL, EntityDSL, ValueObjectDSL } from '../dsl/dsl';
import { ClassLike } from './ClassLike';

export class Entity extends ClassLike<EntityDSL> {
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
    return this.toValueObject();
  }
}
