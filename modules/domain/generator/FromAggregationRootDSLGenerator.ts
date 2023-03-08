import { assert } from '@/lib/utils';
import { EntityDSL, QueryDSL } from '../domain-design/dsl/dsl';
import { createIDDSL, createQuery } from '../domain-design/dsl/factory';
import { createDataObjectDSL, createDataObjectPropertyDSL } from '../data-design/dsl/factory';
import { DataObjectDSL } from '../data-design/dsl/dsl';
import { createFieldMapperDSL, createObjectMapperDSL } from '../mapper-design/dsl/factory';
import { MapperObjectDSL, ObjectReferenceSource } from '../mapper-design/dsl/dsl';

import { BaseGenerator } from './BaseGenerator';
import { BaseGeneratorState } from './BaseGeneratorState';
import { DTOGeneratorState, IDomainObjectStore } from './types';
import { transformTypeDSLToDataObjectTypeDSL } from './transform';
import { FromEntityDSLGenerator } from './FromEntityDSLGenerator';

/**
 * 聚合根自动生成
 */
export class FromAggregationRootDSLGenerator extends BaseGenerator {
  private root: EntityDSL;
  protected domainObjectStore: IDomainObjectStore;
  protected dtoGeneratorState: DTOGeneratorState = new BaseGeneratorState();

  constructor(inject: { entity: EntityDSL; domainObjectStore: IDomainObjectStore }) {
    super();

    const { entity, domainObjectStore } = inject;
    assert(entity.isAggregationRoot, '必须以聚合根为入口进行转换');

    this.root = entity;
    this.domainObjectStore = domainObjectStore;
  }

  generate() {
    const query = this.toQuery();
    const dtos = this.dtoGeneratorState.list;
    const dataObject = this.toDataObject();
    const mapper = this.toMapper(dataObject);

    return {
      query,
      dtos,
      dataObject,
      mapper,
    };
  }

  /**
   * 转换为查询对象
   * @param entity
   */
  protected toQuery(): { detailQuery: QueryDSL; pageQuery: QueryDSL } {
    const root = this.root;

    const dtoTypeDSL = new FromEntityDSLGenerator({
      entity: root,
      dtoGeneratorState: this.dtoGeneratorState,
      queryTypeDSLTransformer: this,
    }).toDTOTypeDSL();

    const entityIdProperty = root.properties.find(i => i.uuid === root.id)!;
    const id = {
      ...entityIdProperty,
      ...createIDDSL(),
      type: entityIdProperty.type && this.transformQueryTypeDSL(entityIdProperty.type),
    };

    // 详情查询
    const detailQuery = createQuery();
    detailQuery.name = `${root.name}Query`;
    detailQuery.title = `${root.title}详情查询对象`;
    detailQuery.description = `查询${root.title}详情`;
    detailQuery.properties = [id];
    detailQuery.result = dtoTypeDSL;

    const pageQuery = createQuery();
    pageQuery.name = `${root.name}PageQuery`;
    pageQuery.title = `${root.title}分页查询对象`;
    pageQuery.description = `分页查询${root.title}`;
    pageQuery.properties = [];
    pageQuery.result = dtoTypeDSL;

    return { detailQuery, pageQuery };
  }

  /**
   * 转换为数据对象
   * @param entity
   */
  protected toDataObject(): DataObjectDSL {
    const root = this.root;

    const dataObject = createDataObjectDSL();
    dataObject.name = `${root.name}DO`;
    dataObject.title = root.title;
    dataObject.description = root.description;
    dataObject.properties = [];

    // 属性转换
    for (const property of root.properties) {
      const type =
        property.type &&
        transformTypeDSLToDataObjectTypeDSL(
          property.type,
          this.domainObjectStore.getObjectById.bind(this.domainObjectStore)
        );

      if (type == null) {
        continue;
      }

      const dataObjectProperty = createDataObjectPropertyDSL();
      dataObjectProperty.name = property.name;
      dataObjectProperty.title = property.title;
      dataObjectProperty.description = property.description;
      dataObjectProperty.type = type;

      if (root.id === property.uuid) {
        // 实体 标识符, 作为主键
        dataObjectProperty.primaryKey = true;
        dataObjectProperty.notNull = true;
      }

      dataObject.properties.push(dataObjectProperty);
    }

    return dataObject;
  }

  /**
   * 转换为对象映射
   * 需要在数据对象转换完成后进行
   */
  protected toMapper(target: DataObjectDSL): MapperObjectDSL {
    const root = this.root;

    const mapper = createObjectMapperDSL();
    mapper.name = `${root.name}To${target.name}`;
    mapper.title = `${root.title}数据对象映射`;
    mapper.description = `用于将聚合根(${root.title})映射为${target.title}(数据对象)`;

    mapper.source = {
      source: ObjectReferenceSource.Domain,
      referenceId: root.uuid,
      name: root.name,
    };

    mapper.target = {
      source: ObjectReferenceSource.Data,
      referenceId: target.uuid,
      name: target.name,
    };

    // 自动字段映射
    for (const property of root.properties) {
      const targetProperty = target.properties.find(p => p.name === property.name);
      if (targetProperty == null) {
        continue;
      }

      const fieldMapper = createFieldMapperDSL();
      fieldMapper.source = property.uuid;
      fieldMapper.target = targetProperty.uuid;

      mapper.mappers.push(fieldMapper);
    }

    return mapper;
  }
}
