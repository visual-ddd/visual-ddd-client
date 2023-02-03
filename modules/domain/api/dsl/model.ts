import { Doc as YDoc } from 'yjs';

import { YJS_FIELD_NAME } from '../../constants';

import * as DSL from './interface';
import { DomainModelContainer, Entity, ValueObject, Node } from './domain-model';
import { DTO, QueryModelContainer } from './query-model';
import { DataModelContainer, DataObject } from './data-model';
import { MapperModelContainer } from './mapper-model';
import { IObjectStore } from './IObjectStore';

export class DSLModel implements IObjectStore {
  private domainModel: DomainModelContainer;
  private queryModel: QueryModelContainer;
  private dataModel: DataModelContainer;
  private mapperModel: MapperModelContainer;
  private vision?: string;

  constructor(doc: YDoc) {
    const domainMap = doc.getMap(YJS_FIELD_NAME.DOMAIN);
    const queryMap = doc.getMap(YJS_FIELD_NAME.QUERY);
    const dataObjectMap = doc.getMap(YJS_FIELD_NAME.DATA_OBJECT);
    const mapperMap = doc.getMap(YJS_FIELD_NAME.MAPPER);

    this.domainModel = new DomainModelContainer(domainMap.toJSON());
    this.queryModel = new QueryModelContainer(queryMap.toJSON());
    this.dataModel = new DataModelContainer(dataObjectMap.toJSON());
    this.mapperModel = new MapperModelContainer(mapperMap.toJSON(), this);
    this.vision = doc.getText(YJS_FIELD_NAME.VISION).toString();
  }

  /**
   * 对象获取
   * @param id
   */
  getObjectById(id: string): { object: Entity | ValueObject | DTO | DataObject; parent?: Node | undefined } {
    const domainObject = this.domainModel.getNodeById(id) as Entity | ValueObject;

    if (domainObject) {
      return {
        object: domainObject,
        parent: domainObject.aggregation,
      };
    }

    const queryObject = this.queryModel.getNodeById(id) as DTO;
    if (queryObject) {
      return {
        object: queryObject,
      };
    }

    const dataObject = this.dataModel.getNodeById(id) as DataObject;

    if (dataObject) {
      return {
        object: dataObject,
      };
    }

    // 对象一定存在
    throw new Error('Object not found');
  }

  toDSL(): DSL.BusinessDomainDSL {
    return {
      domainModel: this.domainModel.toDSL(),
      queryModel: this.queryModel.toDSL(),
      dataModel: this.dataModel.toDSL(),
      objectMapper: this.mapperModel.toDSL(),
      vision: this.vision,
    };
  }
}
