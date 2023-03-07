import { assert } from '@/lib/utils';
import { TypeDSL } from '../domain-design/dsl/dsl';
import { DomainObjectName } from '../domain-design/dsl/constants';

import { FromEntityDSLGenerator } from './FromEntityDSLGenerator';
import { FromEnumDSLGenerator } from './FromEnumDSLGenerator';
import { FromValueObjectDSLGenerator } from './FromValueObjectDSLGenerator';
import { DTOGeneratorState, IDomainObjectStore, IQueryTypeDSLTransformer } from './types';
import { transformTypeDSLReference } from './transform';

export abstract class BaseGenerator implements IQueryTypeDSLTransformer {
  protected abstract domainObjectStore: IDomainObjectStore;
  protected abstract dtoGeneratorState: DTOGeneratorState;

  transformQueryTypeDSL(type: TypeDSL): TypeDSL {
    return transformTypeDSLReference(type, ref => {
      const object = this.domainObjectStore.getObjectById(ref.referenceId);

      assert(!!object, '未找到引用的对象');
      assert(
        object.type === DomainObjectName.Entity ||
          object.type === DomainObjectName.ValueObject ||
          object.type === DomainObjectName.Enum,
        '实体只能引用实体、值对象、枚举'
      );

      switch (object.type) {
        case DomainObjectName.Enum:
          return new FromEnumDSLGenerator({ enum: object.value }).toTypeDSL();
        case DomainObjectName.ValueObject:
          return new FromValueObjectDSLGenerator({
            valueObject: object.value,
            dtoGeneratorState: this.dtoGeneratorState,
            queryTypeDSLTransformer: this,
          }).toDTOTypeDSL();
        case DomainObjectName.Entity:
          return new FromEntityDSLGenerator({
            entity: object.value,
            dtoGeneratorState: this.dtoGeneratorState,
            queryTypeDSLTransformer: this,
          }).toDTOTypeDSL();
      }
    });
  }
}
