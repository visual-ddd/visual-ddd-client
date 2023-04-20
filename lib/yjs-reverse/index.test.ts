/**
 * @jest-environment node
 */
import { Doc, applyUpdate, Array, encodeStateAsUpdate } from 'yjs';
import { getContentDigest, reverseUpdate, collectMetadata, YjsShareType, isReverseOrigin } from './index';

test('getSnapshotDigest', async () => {
  const doc = new Doc();
  const array = doc.getArray('array');
  const text = doc.getText('text');
  array.push([1, 2]);
  text.insert(0, 'hello world');

  expect(doc.toJSON()).toEqual({
    array: [1, 2],
    text: 'hello world',
  });

  const digest1 = await getContentDigest(doc);
  expect(digest1).toBe('c5aeabf34a915f81a28e8950c80faa847f527dfeae36a8455933a992a83290d1');

  // 删除又插入，主体内容没有变化
  array.delete(1);
  array.push([2]);
  text.delete(5, 6);
  text.insert(5, ' world');

  expect(doc.toJSON()).toEqual({
    array: [1, 2],
    text: 'hello world',
  });

  const digest2 = await getContentDigest(doc);
  expect(digest2).toBe(digest1);
});

test('collection metadata', () => {
  const doc = new Doc();
  doc.getArray('array');
  doc.getMap('map');
  doc.getText('text');
  doc.getXmlFragment('xmlFragment');

  const metadata = collectMetadata(doc);

  expect(metadata).toEqual({
    array: YjsShareType.Array,
    map: YjsShareType.Map,
    text: YjsShareType.Text,
    xmlFragment: YjsShareType.XmlFragment,
  });
});

test('collect metadata with unknown type', () => {
  const doc = new Doc();
  doc.get('unknown');

  expect(() => {
    collectMetadata(doc);
  }).toThrow('Unknown YjsShareType: unknown AbstractType');
});

test('reverseUpdate', () => {
  const doc = new Doc();
  const text = doc.getText('text');
  text.insert(0, 'hello');

  expect(doc.toJSON()).toEqual({
    text: 'hello',
  });

  const snapshotUpdate = encodeStateAsUpdate(doc);

  const snapshotDoc = new Doc();
  applyUpdate(snapshotDoc, snapshotUpdate);
  // 如果这里没有调用 get* yjs 无法获取到最终的 share type 类型？
  snapshotDoc.getText('text');
  expect(snapshotDoc.toJSON()).toEqual({
    text: 'hello',
  });

  // 插入增量
  text.insert(5, ' world');
  expect(doc.toJSON()).toEqual({
    text: 'hello world',
  });

  // 回滚
  reverseUpdate(doc, snapshotUpdate);

  expect(doc.toJSON()).toEqual({
    text: 'hello',
  });
});

test('reverseUpdate with complex object', () => {
  const doc = new Doc();
  const text = doc.getText('text');
  text.insert(0, 'hello');

  // 注意，如果这里没有写入任何数据，那么在回滚的时候，yjs 无法获取到 share type 类型
  const array = doc.getArray<string>('array');
  const map = doc.getMap('map');

  const nestedArray = new Array<number>();
  nestedArray.push([1]);
  map.set('a', 'a');
  map.set('b', nestedArray);

  const snapshotState = {
    array: [],
    map: {
      a: 'a',
      b: [1],
    },
    text: 'hello',
  };

  expect(doc.toJSON()).toEqual(snapshotState);

  const snapshotUpdate = encodeStateAsUpdate(doc);

  // 插入增量
  text.insert(5, ' world');
  array.push(['string']);
  nestedArray.push([2]);
  map.set('c', true);

  expect(doc.toJSON()).toEqual({
    array: ['string'],
    map: {
      a: 'a',
      b: [1, 2],
      c: true,
    },
    text: 'hello world',
  });

  let updateOrigin;
  // 监听变化
  doc.on('update', (update, origin, doc, transaction) => {
    updateOrigin = origin;
  });

  // 回滚
  reverseUpdate(doc, snapshotUpdate);

  expect(doc.toJSON()).toEqual(snapshotState);
  expect(isReverseOrigin(updateOrigin)).toBe(true);
});
