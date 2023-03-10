import { Doc as YDoc, Map as YMap } from 'yjs';
import * as mockedUuid from 'uuid';
import { createRoot, buildEditorYjs, buildEmptyEditorYjs, EditorYjsBuilderHelper } from './Builder';

jest.mock('uuid', () => {
  let count = 0;
  return {
    __esModule: true,
    reset() {
      count = 0;
    },
    v4() {
      return `uuid-${count++}`;
    },
  };
});

const mockedUuidModule = mockedUuid as unknown as jest.Mocked<{ reset(): void }>;

function createDoc(): [YDoc, YMap<unknown>] {
  const doc = new YDoc();
  const map = doc.getMap('test');

  return [doc, map];
}

test('createRoot', () => {
  const [doc, map] = createDoc();
  const root = createRoot(['1', '2', '3']);

  map.set('root', root.toYMap());

  expect(doc.toJSON()).toMatchSnapshot();
});

describe('buildEditorYjs', () => {
  beforeEach(() => {
    mockedUuidModule.reset();
  });

  test('EditorYjsBuilderHelper', () => {
    const helper = new EditorYjsBuilderHelper();

    expect(helper.getOrCreateId('foo')).toBe('uuid-0');
    expect(helper.getOrCreateId('foo')).toBe('uuid-0');
    expect(helper.getId('foo')).toBe('uuid-0');
    expect(helper.getOrCreateId('bar')).toBe('uuid-1');
    expect(helper.getOrCreateId()).toBe('uuid-2');

    expect(() => {
      helper.getId('baz');
    }).toThrowError('id not found: baz');
  });

  test('initial State', () => {
    const [doc, map] = createDoc();

    buildEditorYjs(
      {
        nodes: [],
        edges: [],
      },
      map
    );

    expect(doc.toJSON()).toMatchSnapshot();

    const anotherMap = doc.getMap('another');
    buildEmptyEditorYjs(anotherMap);
    expect(map.toJSON()).toEqual(anotherMap.toJSON());
  });

  test('with nodes', () => {
    const [doc, map] = createDoc();

    buildEditorYjs(
      {
        nodes: [
          {
            id: '[keep-it]',
            name: 'my-node',
            properties: {
              a: 1,
              b: 2,
            },
          },
          {
            id: '{foo}',
            name: 'foo',
            properties: helper => ({
              b: 1,
              c: 2,
              d: helper.getId('foo'),
            }),
          },
        ],
        edges: [],
      },
      map
    );

    expect(doc.toJSON()).toMatchSnapshot();
  });

  test('with edges', () => {
    const [doc, map] = createDoc();

    buildEditorYjs(
      {
        nodes: [
          {
            id: '{a}',
            name: 'a',
          },
          {
            id: '{b}',
            name: 'b',
          },
        ],
        edges: [
          {
            source: '{a}',
            target: '{b}',
            name: 'my-edge-a',
          },
          {
            source: { cell: '{b}' },
            target: { cell: '[keep-it]', port: 'port-a' },
            name: 'my-edge-b',
          },
        ],
      },
      map
    );

    expect(doc.toJSON()).toMatchSnapshot();
  });

  test('with children', () => {
    const [doc, map] = createDoc();

    buildEditorYjs(
      {
        nodes: [
          {
            id: '{a}',
            name: 'a',
            children: [
              {
                id: '{b}',
                name: 'b',
              },
              {
                id: '{c}',
                name: 'c',
                properties: {
                  foo: 'bar',
                },
                children: [{ id: '{d}', name: 'd' }],
              },
            ],
          },
        ],
        edges: [
          {
            source: '{a}',
            target: '{d}',
            name: 'edge',
          },
        ],
      },
      map
    );

    expect(doc.toJSON()).toMatchSnapshot();
  });
});
