import { DomainObjectName, NameDSL } from '../dsl';

import { DomainObject, DomainObjectInject } from './DomainObject';
import { DomainObjectAggregation } from './DomainObjectAggregation';
import { DomainObjectCommand } from './DomainObjectCommand';
import { DomainObjectEntity } from './DomainObjectEntity';
import { DomainObjectRule } from './DomainObjectRule';
import { DomainObjectUnderAggregation, IDomainObjectUnderAggregation } from './DomainObjectUnderAggregation';
import { DomainObjectValueObject } from './DomainObjectValueObject';
import { DomainObjectEnum } from './DomainObjectEnum';
import { DomainObjectDTO } from './DomainObjectDTO';
import { DomainObjectQuery } from './DomainObjectQuery';

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
      case DomainObjectName.Command:
        return new DomainObjectCommand(inject);
      case DomainObjectName.Rule:
        return new DomainObjectRule(inject);
      case DomainObjectName.Enum:
        return new DomainObjectEnum(inject);
      case DomainObjectName.DTO:
        return new DomainObjectDTO(inject);
      case DomainObjectName.Query:
        return new DomainObjectQuery(inject);
      default:
        return null;
    }
  }

  /**
   * 判断是否为聚合
   */
  static isAggregation = (object: DomainObject<NameDSL>): object is DomainObjectAggregation => {
    return object instanceof DomainObjectAggregation;
  };

  /**
   * 判断是否为值对象
   * @param object
   * @returns
   */
  static isValueObject = (object: DomainObject<NameDSL>): object is DomainObjectValueObject => {
    return object instanceof DomainObjectValueObject;
  };

  /**
   * 判断是否为实体
   * @param object
   * @returns
   */
  static isEntity = (object: DomainObject<NameDSL>): object is DomainObjectEntity => {
    return object instanceof DomainObjectEntity;
  };

  /**
   * 判断是否为聚合根
   * @param object
   * @returns
   */
  static isAggregationRoot = (object: DomainObject<NameDSL>): object is DomainObjectEntity => {
    return this.isEntity(object) && object.isAggregationRoot;
  };

  /**
   * 是否为命令
   * @param object
   * @returns
   */
  static isCommand = (object: DomainObject<NameDSL>): object is DomainObjectCommand => {
    return object instanceof DomainObjectCommand;
  };

  /**
   * 是否为枚举
   * @param object
   * @returns
   */
  static isEnum = (object: DomainObject<NameDSL>): object is DomainObjectEnum => {
    return object instanceof DomainObjectEnum;
  };

  /**
   * 是否为 DTO
   * @param object
   * @returns
   */
  static isDTO = (object: DomainObject<NameDSL>): object is DomainObjectDTO => {
    return object instanceof DomainObjectDTO;
  };

  /**
   * 是否为查询
   * @param object
   * @returns
   */
  static isQuery = (object: DomainObject<NameDSL>): object is DomainObjectQuery => {
    return object instanceof DomainObjectQuery;
  };

  /**
   * 是否为规则
   * @param object
   * @returns
   */
  static isRule = (object: DomainObject<NameDSL>): object is DomainObjectRule => {
    return object instanceof DomainObjectRule;
  };

  /**
   * 判断是否为归属聚合的对象
   * @param object
   * @returns
   */
  static isUnderAggregation = (object: any): object is IDomainObjectUnderAggregation => {
    return this.isCommand(object) || object instanceof DomainObjectUnderAggregation;
  };
}
