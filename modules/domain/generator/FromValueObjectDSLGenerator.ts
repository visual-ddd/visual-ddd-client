import { DTODSL, ReferenceTypeDSL, TypeType, ValueObjectDSL } from '../domain-design/dsl/dsl';
import { createDTO, createIDDSL } from '../domain-design/dsl/factory';
import { DTOGeneratorState, IQueryTypeDSLTransformer } from './types';

export class FromValueObjectDSLGenerator {
  private valueObject: ValueObjectDSL;
  private dtoGeneratorState: DTOGeneratorState;
  private queryTypeDSLTransformer: IQueryTypeDSLTransformer;

  constructor(inject: {
    valueObject: ValueObjectDSL;
    dtoGeneratorState: DTOGeneratorState;
    queryTypeDSLTransformer: IQueryTypeDSLTransformer;
  }) {
    const { valueObject, dtoGeneratorState, queryTypeDSLTransformer } = inject;

    this.dtoGeneratorState = dtoGeneratorState;
    this.valueObject = valueObject;
    this.queryTypeDSLTransformer = queryTypeDSLTransformer;
  }

  toDTO(): DTODSL {
    const cache = this.dtoGeneratorState.get(this.valueObject.uuid);
    if (cache) {
      return cache;
    }

    const dto = createDTO();

    dto.name = `${this.valueObject.name}DTO`;
    dto.title = `${this.valueObject.title}数据传输对象`;
    dto.description = `用于${this.valueObject.title}的数据传输对象`;
    dto.properties = [];

    // save cache
    this.dtoGeneratorState.save(this.valueObject.uuid, dto);

    for (const property of this.valueObject.properties) {
      dto.properties.push({
        ...property,
        ...createIDDSL(),
        type: property.type && this.queryTypeDSLTransformer.transformQueryTypeDSL(property.type),
      });
    }

    return dto;
  }

  /**
   * 转换为类型引用
   */
  toDTOTypeDSL(): ReferenceTypeDSL {
    const dto = this.toDTO();

    return {
      type: TypeType.Reference,
      referenceId: dto.uuid,
      name: dto.name,
    };
  }
}
