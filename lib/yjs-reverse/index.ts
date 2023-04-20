import {
  Doc,
  UndoManager,
  applyUpdate,
  encodeStateAsUpdate,
  encodeStateVector,
  Array as YArray,
  Map as YMap,
  Text as YText,
  XmlFragment as YXmlFragment,
} from 'yjs';
import { createShaHash } from '@/lib/utils';

export enum YjsShareType {
  Map,
  Array,
  Text,
  XmlFragment,
}

export interface ShareTypeMetaData {
  [key: string]: YjsShareType;
}

/**
 * 收集文档的结构
 * @param doc
 */
export function collectMetadata(doc: Doc) {
  const metaData: ShareTypeMetaData = {};

  for (const [key, value] of doc.share.entries()) {
    if (value instanceof YArray) {
      metaData[key] = YjsShareType.Array;
    } else if (value instanceof YMap) {
      metaData[key] = YjsShareType.Map;
    } else if (value instanceof YText) {
      metaData[key] = YjsShareType.Text;
    } else if (value instanceof YXmlFragment) {
      metaData[key] = YjsShareType.XmlFragment;
    } else {
      throw new Error(`Unknown YjsShareType: ${key} ${value?.constructor?.name}`);
    }
  }

  return metaData;
}

export function assertNoIncludeAbstractType(doc: Doc) {
  for (const [key, value] of doc.share.entries()) {
    if (value instanceof YArray) {
      continue;
    } else if (value instanceof YMap) {
      continue;
    } else if (value instanceof YText) {
      continue;
    } else if (value instanceof YXmlFragment) {
      continue;
    } else {
      throw new Error(`Unknown YjsShareType: ${key} ${value?.constructor?.name}`);
    }
  }
}

export function createSnapshotDocument(snapshotUpdate: Uint8Array) {
  const snapshotDocument = new Doc();
  applyUpdate(snapshotDocument, snapshotUpdate);

  return snapshotDocument;
}

export const REVERSE_ORIGIN = 'SNAPSHOT_REVERSE';

/**
 * 是否为回退的操作
 * @param origin
 * @returns
 */
export function isReverseOrigin(origin?: string) {
  return origin === REVERSE_ORIGIN;
}

/**
 * 获取文档内容摘要
 * @param doc
 * @returns
 */
export function getContentDigest(doc: Doc): Promise<string> {
  assertNoIncludeAbstractType(doc);

  const json = doc.toJSON();
  const jsonStr = JSON.stringify(json);
  const encoder = new TextEncoder();

  return createShaHash(encoder.encode(jsonStr));
}

export function reverseUpdate(currentDocument: Doc, snapshotUpdate: Uint8Array) {
  const snapshotDocument = createSnapshotDocument(snapshotUpdate);

  const currentVector = encodeStateVector(currentDocument);
  const snapshotVector = encodeStateVector(snapshotDocument);

  // 自 snapshotDocument 到 currentDocument 的更新
  const changeBetweenSnapshots = encodeStateAsUpdate(currentDocument, snapshotVector);

  const metadata = collectMetadata(currentDocument);

  // 使用 undo manager 收集反向的变更 delta
  const undoManager = new UndoManager(
    Object.keys(metadata).map(key => {
      const type = metadata[key];

      switch (type) {
        case YjsShareType.Map:
          return snapshotDocument.getMap(key);
        case YjsShareType.Array:
          return snapshotDocument.getArray(key);
        case YjsShareType.Text:
          return snapshotDocument.getText(key);
        case YjsShareType.XmlFragment:
          return snapshotDocument.getXmlFragment(key);
        default:
          throw new Error('Unknown YjsShareType');
      }
    })
  );
  // 更新到最新
  applyUpdate(snapshotDocument, changeBetweenSnapshots);
  undoManager.undo();

  // 获取撤销操作的 delta
  const revertUpdate = encodeStateAsUpdate(snapshotDocument, currentVector);

  // 最终应用操作
  applyUpdate(currentDocument, revertUpdate, REVERSE_ORIGIN);
}
