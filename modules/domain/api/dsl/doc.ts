import { Doc as YDoc, applyUpdate } from 'yjs';

import { YJS_FIELD_NAME } from '../../constants';

import * as DSL from './interface';
import { transform as transformToDomainDSL } from './domain-model';
import { transform as transformToQueryDSL } from './query-model';
import { transform as transformToDataObjectDSL } from './data-model';

/**
 * 创建文档
 * @param update
 * @returns
 */
export function createDoc(update: Uint8Array) {
  const doc = new YDoc();

  applyUpdate(doc, update);

  return doc;
}

/**
 * 转换为 DSL
 * @param doc
 * @returns
 */
export function transformToDSL(doc: YDoc): DSL.BusinessDomainDSL {
  const domainMap = doc.getMap(YJS_FIELD_NAME.DOMAIN);
  const queryMap = doc.getMap(YJS_FIELD_NAME.QUERY);
  const dataObjectMap = doc.getMap(YJS_FIELD_NAME.DATA_OBJECT);

  return {
    domainModel: transformToDomainDSL(domainMap.toJSON()),
    queryModel: transformToQueryDSL(queryMap.toJSON()),
    dataModel: transformToDataObjectDSL(dataObjectMap.toJSON()),
  };
}
