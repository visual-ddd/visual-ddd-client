import { Doc as YDoc, applyUpdate } from 'yjs';
import * as DSL from './interface';
import { transform as transformToDomainDSL } from './domain-model';

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

export function transformToDSL(doc: YDoc): DSL.BusinessDomainDSL {
  const domainMap = doc.getMap('domain');
  // const queryMap = doc.getMap('query');

  return {
    domainModel: transformToDomainDSL(domainMap.toJSON()),
  };
}
