import { createEntityIdProperty } from '../domain-design/dsl/factory';
import type { ClassDSL, DTODSL, EntityDSL, ValueObjectDSL } from '../domain-design/dsl/dsl';

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
    const dto = this.clone();

    dto.methods = [];

    return dto;
  }

  override toEntity(): EntityDSL {
    const entity = this.clone() as unknown as EntityDSL;

    entity.isAggregationRoot = false;

    let idProperty = entity.properties.find(i => i.name.toLowerCase().includes('id')) ?? entity.properties[0];

    if (idProperty) {
      entity.id = idProperty.uuid;
    } else {
      idProperty = createEntityIdProperty();
      entity.id = idProperty.uuid;
      entity.properties.unshift(idProperty);
    }

    return entity;
  }
}
