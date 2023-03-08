import { DTODSL, EntityDSL, ReferenceTypeDSL, TypeType } from '../domain-design/dsl/dsl';
import { createDTO, createIDDSL } from '../domain-design/dsl/factory';

import { DTOGeneratorState, IQueryTypeDSLTransformer } from './types';

export class FromEntityDSLGenerator {
  private entity: EntityDSL;
  private dtoGeneratorState: DTOGeneratorState;
  private queryTypeDSLTransformer: IQueryTypeDSLTransformer;

  constructor(inject: {
    entity: EntityDSL;
    dtoGeneratorState: DTOGeneratorState;
    queryTypeDSLTransformer: IQueryTypeDSLTransformer;
  }) {
    const { entity, dtoGeneratorState, queryTypeDSLTransformer } = inject;

    this.dtoGeneratorState = dtoGeneratorState;
    this.entity = entity;
    this.queryTypeDSLTransformer = queryTypeDSLTransformer;
  }

  toDTO(): DTODSL {
    const cache = this.dtoGeneratorState.get(this.entity.uuid);
    if (cache) {
      return cache;
    }

    const dto = createDTO();

    dto.name = `${this.entity.name}DTO`;
    dto.title = `${this.entity.title}数据传输对象`;
    dto.description = `用于${this.entity.title}的数据传输对象`;
    dto.properties = [];

    // save cache
    this.dtoGeneratorState.save(this.entity.uuid, dto);

    for (const property of this.entity.properties) {
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
