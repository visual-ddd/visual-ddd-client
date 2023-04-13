import { NodePO, NodeYMap } from './NodeYMap';
import { Doc as YDoc } from 'yjs';

test('fromNodePO', () => {
  const po: NodePO = {
    id: 'foo',
    parent: 'bar',
    children: ['hello', 'world'],
    locked: true,
    properties: {
      __node_name__: 'node',
      __node_type__: 'node',
      key: 'value',
    },
  };

  const map = NodeYMap.fromNodePO(po);
  const doc = new YDoc();
  const container = doc.getMap();

  container.set('test', map.toYMap());

  // 只有加入了 doc 才允许操作
  expect(map.parent).toBe('bar');
  expect(map.children.toJSON()).toEqual({ hello: 1, world: 1 });
  expect(map.id).toBe('foo');
  expect(map.locked).toBe(true);
  expect(map.properties.toJSON()).toEqual({
    __PROPERTY__: true,
    __node_name__: 'node',
    __node_type__: 'node',
    key: 'value',
  });

  expect(map.toNodePO()).toEqual({
    children: ['hello', 'world'],
    id: 'foo',
    locked: true,
    parent: 'bar',
    properties: {
      __PROPERTY__: true,
      __node_name__: 'node',
      __node_type__: 'node',
      key: 'value',
    },
  });
});

test('fromYMap', () => {
  const doc = new YDoc();
  const container = doc.getMap();
  const po: NodePO = {
    children: ['hello', 'world'],
    id: 'foo',
    locked: true,
    parent: 'bar',
    properties: {
      __node_name__: 'node',
      __node_type__: 'node',
      key: 'value',
      foo: 'bar',
    },
  };

  const source = NodeYMap.fromNodePO(po);
  container.set('foo', source.toYMap());

  const map = NodeYMap.fromYMap(source.toYMap())!;
  expect(map.toNodePO()).toEqual({
    children: ['hello', 'world'],
    id: 'foo',
    locked: true,
    parent: 'bar',
    properties: {
      __PROPERTY__: true,
      __node_name__: 'node',
      __node_type__: 'node',
      key: 'value',
      foo: 'bar',
    },
  });

  map.parent = 'newParent';
  map.addChild('newChild');
  map.removeChild('hello');
  map.locked = false;
  map.updateProperty('key', 'newValue');
  map.deleteProperty('foo');

  expect(source.toNodePO()).toEqual({
    children: ['world', 'newChild'],
    id: 'foo',
    locked: false,
    parent: 'newParent',
    properties: {
      __PROPERTY__: true,
      __node_name__: 'node',
      __node_type__: 'node',
      key: 'newValue',
    },
  });
  expect(source.toYMap().toJSON()).toEqual({
    __NODE__: true,
    children: {
      newChild: 1,
      world: 1,
    },
    id: 'foo',
    locked: false,
    parent: 'newParent',
    properties: {
      __PROPERTY__: true,
      __node_name__: 'node',
      __node_type__: 'node',
      key: 'newValue',
    },
  });
});
