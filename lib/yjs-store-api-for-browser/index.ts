import { Doc as YDoc, applyUpdate } from 'yjs';
import { readRawData } from './raw';

export function createYDocFromBase64(raw: string) {
  const doc = new YDoc();

  const data = readRawData(raw);

  Promise.resolve().then(() => {
    applyUpdate(doc, data);
  });

  return doc;
}
