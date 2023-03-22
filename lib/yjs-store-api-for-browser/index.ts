import { useMemo } from 'react';
import { Doc as YDoc, applyUpdate } from 'yjs';
import { readRawData } from './raw';

export function createYDocFromBase64(raw: string, updateImmediately = false) {
  const doc = new YDoc();

  const data = readRawData(raw);

  if (updateImmediately) {
    applyUpdate(doc, data);
  } else {
    Promise.resolve().then(() => {
      applyUpdate(doc, data);
    });
  }

  return doc;
}

export function useYDocFromBase64(raw?: string, updateImmediately = false) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const doc = useMemo(() => raw && createYDocFromBase64(raw, updateImmediately), [raw]);

  return doc;
}
