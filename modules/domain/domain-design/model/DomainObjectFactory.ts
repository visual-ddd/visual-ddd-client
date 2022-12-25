import { DomainObjectName, NameDSL } from '../dsl';

import { DomainObject, DomainObjectInject } from './DomainObject';
import { DomainObjectAggregation } from './DomainObjectAggregation';
import { DomainObjectEntity } from './DomainObjectEntity';
import { DomainObjectValueObject } from './DomainObjectValueObject';

export class DomainObjectFactory {
  static getDomainObject(inject: DomainObjectInject): DomainObject<NameDSL> | null {
    const { node } = inject;
    switch (node.name) {
      case DomainObjectName.Aggregation:
        return new DomainObjectAggregation(inject);
      case DomainObjectName.Entity:
        return new DomainObjectEntity(inject);
      case DomainObjectName.ValueObject:
        return new DomainObjectValueObject(inject);
      default:
        return null;
    }
  }

  /**
   * 判断是否为聚合
   */
  static isAggregation(object: DomainObject<NameDSL>): object is DomainObjectAggregation {
    return object instanceof DomainObjectAggregation;
  }

  /**
   * 判断是否为值对象
   * @param object
   * @returns
   */
  static isValueObject(object: DomainObject<NameDSL>): object is DomainObjectValueObject {
    return object instanceof DomainObjectValueObject;
  }

  /**
   * 判断是否为实体
   * @param object
   * @returns
   */
  static isEntity(object: DomainObject<NameDSL>): object is DomainObjectEntity {
    return object instanceof DomainObjectEntity;
  }
}