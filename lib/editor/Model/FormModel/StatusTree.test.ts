import { StatusTree } from './StatusTree';
import { FormItemValidateStatus } from './types';

test('StatusTree', () => {
  let map: Map<string, FormItemValidateStatus> = new Map();

  const tree = new StatusTree({
    onAdd(path, status) {
      map.set(path, status);
    },
    onRemove(path) {
      map.delete(path);
    },
    onUpdate(path, status) {
      map.set(path, status);
    },
  });

  const a_b_c = {
    path: 'a.b.c',
    value: '',
    errors: [],
    warnings: [],
  };
  const a_b = {
    path: 'a.b',
    value: '',
    errors: [],
    warnings: [],
  };

  tree.addStatus('a.b.c', a_b_c);
  tree.addStatus('a.b', a_b);

  expect(map.get('a.b.c')).toEqual(a_b_c);
  expect(map.get('a.b')).toEqual(a_b);

  expect(tree.find('a.b.c')).toEqual(a_b_c);
  expect(tree.findRecursive('a')).toEqual([a_b, a_b_c]);
  expect(tree.findRecursive('')).toEqual([a_b, a_b_c]);

  tree.removeStatus('a.b.c');
  expect(tree.find('a.b.c')).toEqual(undefined);
  expect(tree.findRecursive('a')).toEqual([a_b]);

  tree.removeStatus('a', true);
  expect(tree.findRecursive('')).toEqual([]);
  expect(Array.from(map.values())).toEqual([]);
});
