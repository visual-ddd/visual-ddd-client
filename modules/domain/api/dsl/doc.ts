import { Doc as YDoc, applyUpdate } from 'yjs';
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
  const domainMap = doc.getMap('domain');
  const queryMap = doc.getMap('query');
  const dataObjectMap = doc.getMap('data-object');

  return {
    domainModel: transformToDomainDSL(domainMap.toJSON()),
    queryModel: transformToQueryDSL(queryMap.toJSON()),
    dataModel: transformToDataObjectDSL(dataObjectMap.toJSON()),
  };
}
