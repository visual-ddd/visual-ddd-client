import { createEntityIdProperty } from '../dsl';
import type { ClassDSL, DTODSL, EntityDSL, ValueObjectDSL } from '../dsl/dsl';

import { PropertiesLike } from './PropertiesLike';

export class ClassLike<T extends ClassDSL> extends PropertiesLike<T> {
  override clone() {
    const clone = super.clone();

    // 拷贝类特有的属性
    this.regenerateUUIDList(clone.classProperties);
    this.regenerateUUIDList(clone.methods);
    this.regenerateUUIDList(clone.classMethods);

    return clone;
  }

  override toValueObject(): ValueObjectDSL {
    return this.clone();
  }

  override toDTO(): DTODSL {
    return this.clone();
  }

  override toEntity(): EntityDSL {
    const entity = this.clone() as unknown as EntityDSL;

    entity.isAggregationRoot = false;
    const id = this.getEntityId();
    if (id) {
      entity.id = id;
    } else {
      const idProperty = createEntityIdProperty();
      entity.id = idProperty.uuid;
      entity.properties.unshift(idProperty);
    }

    return entity;
  }
}
