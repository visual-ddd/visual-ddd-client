import {
  transformProperty,
  transformType,
  transformIndex,
  transformDataObjectReference,
  transform,
} from './data-model';
import * as ViewDSL from '@/modules/domain/data-design/dsl/dsl';

const getReference = (id: string, propertyId: string): ViewDSL.DataObjectPropertyDSL => {
  return {
    uuid: propertyId,
    name: 'name',
    type: { type: ViewDSL.DataObjectTypeName.Date },
  };
};

test('transformType', () => {
  expect(
    transformType(
      {
        type: ViewDSL.DataObjectTypeName.Date,
        // @ts-expect-error
        defaultValue: '',
      },
      getReference
    )
  ).toEqual({
    type: ViewDSL.DataObjectTypeName.Date,
    defaultValue: undefined,
  });

  expect(
    transformType(
      {
        type: ViewDSL.DataObjectTypeName.Boolean,
        defaultValue: true,
      },
      getReference
    )
  ).toEqual({
    type: ViewDSL.DataObjectTypeName.Boolean,
    defaultValue: true,
  });

  expect(
    transformType(
      {
        type: ViewDSL.DataObjectTypeName.Reference,
        target: 'target',
        targetProperty: 'targetProperty',
      },
      getReference
    )
  ).toEqual({
    type: ViewDSL.DataObjectTypeName.Date,
  });
});

test('transformProperty', () => {
  expect(
    transformProperty(
      {
        uuid: 'uuid',
        name: 'name',
        title: 'title',
        description: 'description',
        meta: [],
        propertyName: '',
        type: {
          type: ViewDSL.DataObjectTypeName.Date,
          defaultValue: '2022-12-12',
        },
        primaryKey: true,
      },
      getReference
    )
  ).toEqual({
    defaultValue: '2022-12-12',
    description: 'description',
    meta: {},
    name: 'name',
    notNull: true,
    propertyName: undefined,
    title: 'title',
    type: 'Date',
    uuid: 'uuid',
  });
});

test('transformIndex', () => {
  expect(
    transformIndex(
      {
        uuid: 'uuid',
        name: 'name',
        title: 'title',
        description: 'description',
        meta: [],
        properties: ['1', '2'],
        type: ViewDSL.DataObjectIndexType.Unique,
        method: ViewDSL.DataObjectIndexMethod.HASH,
      },
      id => {
        return { uuid: id, name: `Name${id}`, type: { type: ViewDSL.DataObjectTypeName.Date } };
      }
    )
  ).toEqual({
    description: 'description',
    meta: {},
    method: 'HASH',
    name: 'name',
    properties: ['Name1', 'Name2'],
    title: 'title',
    type: 'Unique',
    uuid: 'uuid',
  });
});

test('transformDataObjectReference', () => {
  expect(
    transformDataObjectReference(
      {
        uuid: 'me',
        name: 'name',
        title: 'title',
        properties: [
          {
            uuid: 'uuid',
            name: 'one',
            type: {
              type: ViewDSL.DataObjectTypeName.Reference,
              target: 'target',
              targetProperty: 'one',
              cardinality: ViewDSL.DataObjectReferenceCardinality.ManyToOne,
            },
          },
          {
            uuid: 'uuid',
            name: 'two',
            type: {
              type: ViewDSL.DataObjectTypeName.Reference,
              target: 'target',
              targetProperty: 'two',
            },
          },
          // 自我引用
          {
            uuid: 'uuid',
            name: 'three',
            type: {
              type: ViewDSL.DataObjectTypeName.Reference,
              target: 'me',
              targetProperty: 'two',
            },
          },
        ],
        indexes: [],
      },
      id => {
        return {
          uuid: id,
          name: `name${id}`,
          properties: [],
          indexes: [],
        };
      },
      (id, propertyId) => {
        return {
          uuid: propertyId,
          name: `name${propertyId}`,
          type: { type: ViewDSL.DataObjectTypeName.Date },
        };
      }
    )
  ).toEqual({
    source: 'name',
    targets: [
      {
        target: 'nametarget',
        cardinality: 'ManyToOne',
        mapper: [
          {
            sourceField: 'one',
            targetField: 'nameone',
          },
          {
            sourceField: 'two',
            targetField: 'nametwo',
          },
        ],
      },
    ],
  });
});

test('transform', () => {
  const data = {
    __ROOT__: {
      __NODE__: true,
      id: '__ROOT__',
      children: {
        'b51bebe2-85ee-4733-b9a0-25926d3d93dc': 1,
        '28d7cc24-2bef-49fe-a4a1-7e3e11c87796': 1,
        'copy-f2853107-0547-4ade-bf42-90ec5cbfcb24': 1,
      },
      properties: { __node_name__: '__ROOT__', __node_type__: 'node', __PROPERTY__: true },
    },
    'b51bebe2-85ee-4733-b9a0-25926d3d93dc': {
      __NODE__: true,
      id: 'b51bebe2-85ee-4733-b9a0-25926d3d93dc',
      parent: '__ROOT__',
      children: {},
      properties: {
        __node_name__: 'dataObject',
        __node_type__: 'node',
        position: { x: 60, y: 45 },
        uuid: 'b51bebe2-85ee-4733-b9a0-25926d3d93dc',
        name: 'Untitled',
        title: '未命名',
        description: '',
        meta: [],
        properties: [
          {
            uuid: '237497a4-0497-4088-b4a6-1fadc7a24987',
            name: 'a',
            title: '',
            description: '',
            meta: [],
            notNull: false,
            primaryKey: false,
            type: {
              type: 'Reference',
              target: '28d7cc24-2bef-49fe-a4a1-7e3e11c87796',
              targetProperty: '4338a498-08c1-45a3-b0de-8ba7b2d28a42',
              cardinality: 'OneToMany',
            },
          },
          {
            uuid: '49d8636d-71f9-4e1e-aa34-c68e5bec4be1',
            name: 'b',
            title: '',
            description: '',
            meta: [],
            notNull: false,
            primaryKey: false,
            type: {
              type: 'Reference',
              target: '28d7cc24-2bef-49fe-a4a1-7e3e11c87796',
              targetProperty: '8ade40eb-c860-42e6-9093-413ffb8972e4',
              cardinality: 'ManyToMany',
            },
          },
          {
            uuid: '4cbb88ae-8c97-482f-bfbf-9376201447e7',
            name: 'name',
            title: '',
            description: '',
            meta: [],
            notNull: false,
            primaryKey: true,
            type: { type: 'String' },
          },
        ],
        indexes: [
          {
            uuid: 'd4d04958-b0a7-4967-bdc0-c4e7444eccb0',
            name: 'untitled0',
            title: '未命名',
            description: '',
            meta: [],
            type: 'Unique',
            properties: ['237497a4-0497-4088-b4a6-1fadc7a24987', '49d8636d-71f9-4e1e-aa34-c68e5bec4be1'],
            method: 'BTREE',
          },
        ],
        zIndex: 2,
        __PROPERTY__: true,
        size: { width: 200, height: 118.1875 },
      },
    },
    '28d7cc24-2bef-49fe-a4a1-7e3e11c87796': {
      __NODE__: true,
      id: '28d7cc24-2bef-49fe-a4a1-7e3e11c87796',
      parent: '__ROOT__',
      children: {},
      properties: {
        __node_name__: 'dataObject',
        __node_type__: 'node',
        position: { x: 60, y: 240 },
        uuid: '28d7cc24-2bef-49fe-a4a1-7e3e11c87796',
        name: 'HelloWorld',
        title: '你好世界',
        description: '',
        meta: [],
        properties: [
          {
            uuid: '4338a498-08c1-45a3-b0de-8ba7b2d28a42',
            name: 'untitled',
            title: '',
            description: '',
            meta: [],
            notNull: true,
            primaryKey: false,
            type: { type: 'String' },
          },
          {
            uuid: '8ade40eb-c860-42e6-9093-413ffb8972e4',
            name: 'untitled1',
            title: '',
            description: '',
            meta: [],
            notNull: false,
            primaryKey: true,
            type: { type: 'String' },
          },
          {
            uuid: 'e9bbcdbd-15ec-49db-9130-d0069f89f3ef',
            name: 'untitled2',
            title: '',
            description: '',
            meta: [],
            notNull: false,
            primaryKey: false,
            type: { type: 'String' },
          },
        ],
        indexes: [],
        zIndex: 2,
        __PROPERTY__: true,
        size: { width: 200, height: 118.1875 },
      },
    },
    'copy-f2853107-0547-4ade-bf42-90ec5cbfcb24': {
      __NODE__: true,
      id: 'copy-f2853107-0547-4ade-bf42-90ec5cbfcb24',
      parent: '__ROOT__',
      children: {},
      properties: {
        __node_name__: 'dataObject',
        __node_type__: 'node',
        uuid: 'copy-f2853107-0547-4ade-bf42-90ec5cbfcb24',
        name: 'Just',
        title: '你好世界',
        description: '',
        meta: [],
        properties: [
          {
            uuid: '4338a498-08c1-45a3-b0de-8ba7b2d28a42',
            name: 'untitled',
            title: '',
            description: '',
            meta: [],
            notNull: true,
            primaryKey: false,
            type: { type: 'String', defaultValue: 'hello', length: 6 },
          },
          {
            uuid: '8ade40eb-c860-42e6-9093-413ffb8972e4',
            name: 'untitled1',
            title: '',
            description: '',
            meta: [],
            notNull: false,
            primaryKey: true,
            type: { type: 'String' },
          },
          {
            uuid: 'e9bbcdbd-15ec-49db-9130-d0069f89f3ef',
            name: 'untitled2',
            title: '',
            description: '',
            meta: [],
            notNull: false,
            primaryKey: false,
            type: { type: 'String' },
          },
        ],
        indexes: [],
        zIndex: 2,
        position: { x: 302, y: 143.1875 },
        __PROPERTY__: true,
        size: { width: 200, height: 118.1875 },
      },
    },
  };

  expect(transform(data as any)).toMatchSnapshot();
});
