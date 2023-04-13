import { Doc as YDoc } from 'yjs';
import { BaseNode } from '../BaseNode';
import { NodeYMap } from './NodeYMap';
import { sync } from './sync';

test('sync', () => {
  const parent = new BaseNode('parent', 'parent', 'node');
  const child1 = new BaseNode('child1', 'child1', 'node');
  const child2 = new BaseNode('child2', 'child2', 'node');
  const child3 = new BaseNode('child3', 'child3', 'node');

  parent.setProperty('foo', 'bar');
  parent.setProperty('hello', 'world');

  child1.setProperty('object', { foo: 1, bar: 1 });
  child1.setProperty('array', [1, 2, 3]);
  child1.setProperty('deep', [1, 2, { 1: 1 }]);
  child1.setProperty('number', 1);
  child1.setProperty('string', 'str');

  parent.appendChild(child1);
  parent.appendChild(child2);
  parent.appendChild(child3);

  const doc = new YDoc();
  const container = doc.getMap();

  // sync root
  const parentMap = NodeYMap.fromNodePO({
    id: 'parent',
    children: ['child1'],
    locked: true,
    properties: {
      __node_name__: 'parent',
      __node_type__: 'node',
      hello: 'updateMe',
      removeMe: true,
    },
  });
  const child1Map = NodeYMap.fromNodePO({
    id: 'child1',
    children: [],
    locked: true,
    properties: {
      __node_name__: 'child1',
      __node_type__: 'node',
      array: [1, 2, 3],
      object: { foo: 1, bar: 1 },
      deep: [1, 2, { 2: 2 }],
      number: 2,
      removeMe: true,
    },
  });
  container.set('parent', parentMap.toYMap());
  container.set('child1', child1Map.toYMap());

  // parent sync
  const tasks = sync(parent, parentMap);
  expect(tasks.length > 0).toBe(true);

  // run tasks
  tasks.forEach(f => f());

  expect(parentMap.toNodePO()).toEqual({
    children: ['child1', 'child2', 'child3'],
    id: 'parent',
    locked: false,
    parent: undefined,
    properties: {
      __PROPERTY__: true,
      __node_name__: 'parent',
      __node_type__: 'node',
      foo: 'bar',
      hello: 'world',
    },
  });

  // child sync
  const tasks2 = sync(child1, child1Map);
  expect(tasks2.length).toBe(6);
  tasks2.forEach(f => f());
  expect(child1Map.toNodePO()).toEqual({
    children: [],
    id: 'child1',
    locked: false,
    parent: 'parent',
    properties: {
      __PROPERTY__: true,
      __node_name__: 'child1',
      __node_type__: 'node',
      array: [1, 2, 3],
      deep: [
        1,
        2,
        {
          '1': 1,
        },
      ],
      number: 1,
      object: {
        bar: 1,
        foo: 1,
      },
      string: 'str',
    },
  });
});
