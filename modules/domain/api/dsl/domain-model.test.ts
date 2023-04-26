import fs from 'fs';
import path from 'path';
import * as ViewDSL from '@/modules/domain/domain-design/dsl/dsl';
import {
  DomainModelContainer,
  transformMeta,
  transformType,
  transformProperty,
  transformMethods,
  transformEnum,
  transformRule,
  transformParameter,
} from './domain-model';
import { Tree, BaseContainer } from './shared';

test('transformMeta', () => {
  expect(transformMeta([])).toEqual({});
  expect(transformMeta([{ key: '', value: '' }])).toEqual({});
  expect(transformMeta([{ key: 'ok', value: '' }])).toEqual({});
  expect(transformMeta([{ key: 'ok', value: 'yes' }])).toEqual({ ok: 'yes' });
});

test('transformType', () => {
  const getRef = (id: string) => ({ name: `NameOf${id}`, uuid: id });
  expect(transformType({ type: ViewDSL.TypeType.Base, name: 'Boolean' }, getRef)).toBe('Boolean');
  expect(
    transformType(
      {
        type: ViewDSL.TypeType.Container,
        name: 'List',
        params: { item: { type: ViewDSL.TypeType.Base, name: 'Boolean' } },
      },
      getRef
    )
  ).toBe('List<Boolean>');

  expect(
    transformType(
      {
        type: ViewDSL.TypeType.Container,
        name: 'Map',
        params: {
          key: { type: ViewDSL.TypeType.Base, name: 'Boolean' },
          value: {
            type: ViewDSL.TypeType.Reference,
            referenceId: 'Foo',
            name: 'Foo',
          },
        },
      },
      getRef
    )
  ).toBe('Map<Boolean, [NameOfFoo:Foo]>');

  expect(
    transformType(
      {
        type: ViewDSL.TypeType.Container,
        name: 'Map',
        params: {
          key: { type: ViewDSL.TypeType.Base, name: 'Boolean' },
          value: {
            type: ViewDSL.TypeType.Container,
            name: 'List',
            params: {
              item: {
                type: ViewDSL.TypeType.Reference,
                referenceId: 'Foo',
                name: 'Foo',
              },
            },
          },
        },
      },
      getRef
    )
  ).toBe('Map<Boolean, List<[NameOfFoo:Foo]>>');
});

test('transformProperty', () => {
  const getRef = (id: string) => ({ name: `NameOf${id}`, uuid: id });
  expect(
    transformProperty(
      {
        uuid: '1',
        title: 'ok',
        name: 'ok',
        description: 'ok',
        access: 'protected',
        optional: true,
        type: { type: ViewDSL.TypeType.Base, name: 'Boolean' },
      },
      getRef
    )
  ).toEqual({
    access: 'protected',
    description: 'ok',
    meta: undefined,
    name: 'ok',
    title: 'ok',
    type: 'Boolean',
    optional: true,
    uuid: '1',
  });

  expect(
    transformProperty(
      {
        uuid: '1',
        title: 'ok',
        name: 'ok',
        description: 'ok',
      },
      getRef
    )
  ).toEqual({
    description: 'ok',
    meta: undefined,
    name: 'ok',
    title: 'ok',
    type: 'Void',
    uuid: '1',
  });
});

test('transformParameter', () => {
  const getRef = (id: string) => ({ name: `NameOf${id}`, uuid: id });
  expect(
    transformParameter(
      {
        uuid: '1',
        title: 'ok',
        name: 'ok',
        description: 'ok',
        optional: true,
        type: { type: ViewDSL.TypeType.Base, name: 'Boolean' },
      },
      getRef
    )
  ).toEqual({
    description: 'ok',
    meta: undefined,
    name: 'ok',
    title: 'ok',
    type: 'Boolean',
    optional: true,
    uuid: '1',
  });

  expect(
    transformParameter(
      {
        uuid: '1',
        title: 'ok',
        name: 'ok',
        description: 'ok',
      },
      getRef
    )
  ).toEqual({
    description: 'ok',
    meta: undefined,
    name: 'ok',
    title: 'ok',
    type: 'Void',
    uuid: '1',
  });
});

test('transformMethods', () => {
  const getRef = () => ({ name: 'Foo', uuid: 'ok' });

  expect(transformMethods([], getRef)).toEqual([]);
  expect(
    transformMethods(
      [
        {
          uuid: '0',
          name: 'foo',
          parameters: [],
        },
      ],
      getRef
    )
  ).toEqual([
    {
      abstract: undefined,
      access: undefined,
      description: undefined,
      meta: undefined,
      name: 'foo',
      signature: {
        uuid: '0',
        description: undefined,
        parameters: [],
        return: {
          type: 'void',
        },
      },
      title: undefined,
      uuid: '0-method',
    },
  ]);

  expect(() => {
    transformMethods(
      [
        {
          uuid: '0',
          name: 'foo',
          parameters: [],
        },
        {
          uuid: '2',
          name: 'foo',
          parameters: [{ uuid: '2-1', name: 'a', type: { type: ViewDSL.TypeType.Base, name: 'Boolean' } }],
          result: { type: ViewDSL.TypeType.Base, name: 'Char' },
        },
      ],
      getRef
    );
  }).toThrowError();

  //   .toEqual([
  //   {
  //     abstract: undefined,
  //     access: undefined,
  //     description: undefined,
  //     meta: undefined,
  //     name: 'foo',
  //     signature: [
  //       {
  //         description: undefined,
  //         parameters: [],
  //         return: {
  //           type: 'void',
  //         },
  //       },
  //       {
  //         description: undefined,
  //         parameters: [
  //           {
  //             description: undefined,
  //             meta: undefined,
  //             name: 'a',
  //             title: undefined,
  //             type: 'Boolean',
  //             uuid: '2-1',
  //           },
  //         ],
  //         return: {
  //           type: 'Char',
  //         },
  //       },
  //     ],
  //     title: undefined,
  //     uuid: '0',
  //   },
  // ]);
});

test('transformEnum', () => {
  expect(
    transformEnum({ uuid: '1', name: 'ok', title: 'ok', description: 'ok', baseType: 'number', members: [] })
  ).toEqual({
    baseType: 'number',
    description: 'ok',
    members: [],
    meta: undefined,
    name: 'ok',
    title: 'ok',
    uuid: '1',
  });

  expect(
    transformEnum({
      uuid: '1',
      name: 'ok',
      title: 'ok',
      description: 'ok',
      baseType: 'number',
      members: [
        {
          uuid: '1-1',
          name: 'Ok',
          code: '1',
        },
      ],
    })
  ).toEqual({
    baseType: 'number',
    description: 'ok',
    members: [
      {
        code: 1,
        description: undefined,
        meta: undefined,
        name: 'Ok',
        title: undefined,
        uuid: '1-1',
      },
    ],
    meta: undefined,
    name: 'ok',
    title: 'ok',
    uuid: '1',
  });
});

test('transformRule', () => {
  expect(
    transformRule({
      uuid: '1',
      title: 'ok',
      name: 'ok',
      description: 'desc',
    })
  ).toEqual({
    description: 'desc',
    meta: undefined,
    name: 'ok',
    title: 'ok',
    uuid: '1',
  });
});

const DATA = {
  __ROOT__: {
    __NODE__: true,
    id: '__ROOT__',
    children: {
      '3cdd4fd4-9f49-4747-b85d-2898759a880d': 1,
      '5a2fe372-faa6-42ce-912e-992809a358e9': 1,
      'copy-0026add6-8a2a-4e26-bc08-2c5d95443445': 1,
      'f7905b48-9e01-407c-a41b-8a8bebfab920': 1,
      'copy-44a87083-8392-499e-8c01-a7adbdaa9a34': 1,
      'copy-78a9324b-773f-4cd4-9690-db995602e492': 1,
    },
    properties: { __node_name__: '__ROOT__', __node_type__: 'node', __PROPERTY__: true },
  },
  '3cdd4fd4-9f49-4747-b85d-2898759a880d': {
    __NODE__: true,
    id: '3cdd4fd4-9f49-4747-b85d-2898759a880d',
    parent: '__ROOT__',
    children: {
      '89772ddd-2140-4ef6-b330-52d465f8cc78': 1,
      'copy-db705261-7462-4c77-88e3-ac9c782534d1': 1,
      '499bfd1e-e43b-4310-af32-c5d95b3f97d6': 1,
      '918dddbf-a695-4760-b4ad-8dfd1b66571f': 1,
    },
    properties: {
      __node_name__: 'aggregation',
      __node_type__: 'node',
      position: { x: 91, y: 420 },
      uuid: '3cdd4fd4-9f49-4747-b85d-2898759a880d',
      name: 'Untitled',
      title: '未命名',
      description: '',
      meta: [],
      color: '#D9F7BE',
      zIndex: 1,
      size: { width: 586, height: 391.125 },
      __prevent_auto_resize__: true,
      originSize: { width: 500, height: 300 },
      __PROPERTY__: true,
    },
  },
  '89772ddd-2140-4ef6-b330-52d465f8cc78': {
    __NODE__: true,
    id: '89772ddd-2140-4ef6-b330-52d465f8cc78',
    parent: '3cdd4fd4-9f49-4747-b85d-2898759a880d',
    children: {},
    properties: {
      __node_name__: 'value-object',
      __node_type__: 'node',
      position: { x: 152, y: 675 },
      uuid: '89772ddd-2140-4ef6-b330-52d465f8cc78',
      name: 'ValueObject',
      title: '未命名',
      description: '',
      meta: [],
      implements: [],
      abstract: false,
      properties: [
        {
          uuid: 'e6b0f980-ca73-4af9-956e-bec51d1b66cc',
          name: 'untitled',
          title: '未命名',
          description: '',
          meta: [],
          type: { type: 'base', name: 'String' },
          access: 'public',
        },
      ],
      methods: [],
      classProperties: [],
      classMethods: [],
      zIndex: 2,
      __PROPERTY__: true,
    },
  },
  '5a2fe372-faa6-42ce-912e-992809a358e9': {
    __NODE__: true,
    id: '5a2fe372-faa6-42ce-912e-992809a358e9',
    parent: '__ROOT__',
    children: {},
    properties: {
      __node_name__: 'command',
      __node_type__: 'node',
      position: { x: 270, y: -15 },
      uuid: '5a2fe372-faa6-42ce-912e-992809a358e9',
      name: 'Untitled',
      title: '未命名',
      description: '',
      meta: [],
      source: {
        http: { enabled: true },
        rpc: { enabled: true },
        event: { enabled: false, value: '' },
        schedule: { enabled: false, value: '' },
      },
      properties: [
        {
          uuid: 'dfe5dff7-2035-4363-9839-29ff4fd103cc',
          name: 'untitled',
          title: '未命名',
          description: '',
          meta: [],
          type: { type: 'base', name: 'String' },
          access: 'public',
        },
      ],
      eventProperties: [],
      repository: 'modify',
      eventSendable: false,
      aggregation: { referenceId: '3cdd4fd4-9f49-4747-b85d-2898759a880d', name: '未命名(Untitled)' },
      zIndex: 2,
      __PROPERTY__: true,
    },
  },
  'copy-0026add6-8a2a-4e26-bc08-2c5d95443445': {
    __NODE__: true,
    id: 'copy-0026add6-8a2a-4e26-bc08-2c5d95443445',
    parent: '__ROOT__',
    children: {},
    properties: {
      __node_name__: 'command',
      __node_type__: 'node',
      uuid: 'copy-0026add6-8a2a-4e26-bc08-2c5d95443445',
      name: 'Untitled',
      title: '未命名',
      description: '',
      meta: [],
      source: {
        http: { enabled: true },
        rpc: { enabled: true },
        event: { enabled: false, value: '' },
        schedule: { enabled: false, value: '' },
      },
      properties: [
        {
          uuid: 'dfe5dff7-2035-4363-9839-29ff4fd103cc',
          name: 'untitled',
          title: '未命名',
          description: '',
          meta: [],
          type: { type: 'base', name: 'String' },
          access: 'public',
        },
      ],
      eventProperties: [],
      repository: 'modify',
      eventSendable: false,
      zIndex: 2,
      position: { x: 555, y: 0 },
      size: { width: 200, height: 129.96875 },
      __PROPERTY__: true,
    },
  },
  'f7905b48-9e01-407c-a41b-8a8bebfab920': {
    __NODE__: true,
    id: 'f7905b48-9e01-407c-a41b-8a8bebfab920',
    parent: '__ROOT__',
    children: {},
    properties: {
      __node_name__: 'rule',
      __node_type__: 'node',
      position: { x: 210, y: 204 },
      uuid: 'f7905b48-9e01-407c-a41b-8a8bebfab920',
      name: 'Untitled1',
      title: '未命名',
      description: '规则描述',
      meta: [],
      aggregator: { referenceId: '5a2fe372-faa6-42ce-912e-992809a358e9', name: '未命名(Untitled)' },
      zIndex: 2,
      __PROPERTY__: true,
    },
  },
  'copy-44a87083-8392-499e-8c01-a7adbdaa9a34': {
    __NODE__: true,
    id: 'copy-44a87083-8392-499e-8c01-a7adbdaa9a34',
    parent: '__ROOT__',
    children: {},
    properties: {
      __node_name__: 'rule',
      __node_type__: 'node',
      uuid: 'copy-44a87083-8392-499e-8c01-a7adbdaa9a34',
      name: 'Untitled2',
      title: '未命名',
      description: '规则描述',
      meta: [],
      aggregator: { referenceId: '5a2fe372-faa6-42ce-912e-992809a358e9', name: '未命名(Untitled)' },
      zIndex: 2,
      position: { x: 384, y: 204 },
      size: { width: 150, height: 94.125 },
      __PROPERTY__: true,
    },
  },
  'copy-78a9324b-773f-4cd4-9690-db995602e492': {
    __NODE__: true,
    id: 'copy-78a9324b-773f-4cd4-9690-db995602e492',
    parent: '__ROOT__',
    children: {},
    properties: {
      __node_name__: 'rule',
      __node_type__: 'node',
      uuid: 'copy-78a9324b-773f-4cd4-9690-db995602e492',
      name: 'Untitled2',
      title: '未命名',
      description: '规则描述',
      meta: [],
      aggregator: { referenceId: 'copy-0026add6-8a2a-4e26-bc08-2c5d95443445', name: '未命名(Untitled)' },
      zIndex: 2,
      position: { x: 614, y: 204 },
      size: { width: 150, height: 94.125 },
      __PROPERTY__: true,
    },
  },
  'copy-db705261-7462-4c77-88e3-ac9c782534d1': {
    __NODE__: true,
    id: 'copy-db705261-7462-4c77-88e3-ac9c782534d1',
    parent: '3cdd4fd4-9f49-4747-b85d-2898759a880d',
    children: {},
    properties: {
      __node_name__: 'entity',
      __node_type__: 'node',
      uuid: 'copy-db705261-7462-4c77-88e3-ac9c782534d1',
      name: 'Untitled2',
      title: '未命名',
      description: '',
      meta: [],
      implements: [],
      abstract: false,
      properties: [
        {
          uuid: 'c1df59f2-5d44-41fd-80ff-fabfaab1d255',
          name: 'untitled',
          title: '未命名',
          description: '',
          meta: [],
          type: { type: 'reference', referenceId: '918dddbf-a695-4760-b4ad-8dfd1b66571f', name: 'MyEnum' },
          access: 'public',
        },
      ],
      methods: [
        {
          uuid: '53afcda5-ad8e-45a0-887b-1a23620f2235',
          name: 'untitled',
          title: '',
          description: '',
          meta: [],
          access: 'public',
          abstract: false,
          parameters: [],
        },
      ],
      classProperties: [],
      classMethods: [],
      isAggregationRoot: false,
      id: 'c1df59f2-5d44-41fd-80ff-fabfaab1d255',
      zIndex: 2,
      position: { x: 369, y: 503 },
      size: { width: 200, height: 118.96875 },
      __PROPERTY__: true,
    },
  },
  '499bfd1e-e43b-4310-af32-c5d95b3f97d6': {
    __NODE__: true,
    id: '499bfd1e-e43b-4310-af32-c5d95b3f97d6',
    parent: '3cdd4fd4-9f49-4747-b85d-2898759a880d',
    children: {},
    properties: {
      __node_name__: 'entity',
      __node_type__: 'node',
      position: { x: 137, y: 503 },
      uuid: '499bfd1e-e43b-4310-af32-c5d95b3f97d6',
      name: 'Untitled',
      title: '未命名',
      description: '',
      meta: [],
      implements: [],
      abstract: false,
      properties: [
        {
          uuid: '0c9ad68c-19de-459e-be69-57d2c07c6dfa',
          name: 'untitled',
          title: '未命名',
          description: '',
          meta: [],
          type: { type: 'base', name: 'String' },
          access: 'public',
        },
      ],
      methods: [
        {
          uuid: 'f1559572-9a47-43a7-8df7-c2a690c1e57b',
          name: 'untitled',
          title: '',
          description: '',
          meta: [],
          access: 'public',
          abstract: false,
          parameters: [],
        },
      ],
      classProperties: [],
      classMethods: [],
      isAggregationRoot: true,
      id: '0c9ad68c-19de-459e-be69-57d2c07c6dfa',
      zIndex: 2,
      __PROPERTY__: true,
    },
  },
  '918dddbf-a695-4760-b4ad-8dfd1b66571f': {
    __NODE__: true,
    id: '918dddbf-a695-4760-b4ad-8dfd1b66571f',
    parent: '3cdd4fd4-9f49-4747-b85d-2898759a880d',
    children: {},
    properties: {
      __node_name__: 'enum',
      __node_type__: 'node',
      position: { x: 432, y: 675 },
      uuid: '918dddbf-a695-4760-b4ad-8dfd1b66571f',
      name: 'MyEnum',
      title: '未命名',
      description: '',
      meta: [],
      baseType: 'number',
      members: [
        {
          uuid: '39f48e70-09bf-4f53-93b4-04a550a6e286',
          name: 'UNTITLED',
          title: '',
          description: '',
          meta: [],
          code: '0',
        },
      ],
      zIndex: 2,
      __PROPERTY__: true,
    },
  },
};

test('BaseContainer', () => {
  class MyContainer extends BaseContainer {
    ids: string[] = [];

    handle(node: Tree<any>): void {
      this.ids.push(node.id);
    }
  }

  const c = new MyContainer();
  c.traverse(DATA as any);

  expect(c.ids).toMatchSnapshot();
});

test('Container', () => {
  const container = new DomainModelContainer(DATA as any);

  expect(container.toDSL()).toMatchSnapshot();
});

test('real data', async () => {
  const data = JSON.parse((await fs.promises.readFile(path.resolve(__dirname, './domain-model.data.json'))).toString());

  const container = new DomainModelContainer(data as any);

  expect(container.toDSL()).toMatchSnapshot();
});
