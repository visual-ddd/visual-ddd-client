import { Doc as YDoc, applyUpdate } from 'yjs';

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

export function transformToDomainDSL(payload: any) {
  console.log(payload);
}

export function transformToDSL(doc: YDoc) {
  const domainMap = doc.getMap('domain');
  // const queryMap = doc.getMap('query');

  transformToDomainDSL(domainMap.toJSON());
}
