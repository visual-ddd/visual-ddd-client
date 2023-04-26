import { dslDelta, moveDetectForDomainModel } from './dsl-delta';
import { ApplicationDSL, Delta, DomainModelDSL, NormalizedBusinessDomainDSL } from './protocol';

describe('move detect', () => {
  test('root move to entities', () => {
    const domain: DomainModelDSL = {
      aggregates: [
        {
          uuid: '1',
          name: '1',
          root: {
            uuid: '01',
            name: 'User',
            meta: {},
            id: {
              uuid: '011',
              name: 'id',
              description: '',
              meta: {},
              access: 'public',
              type: 'Long',
            },
            properties: [],
            methods: [],
            __delta: {
              op: Delta.OP.OP_NEW,
              deltas: [],
            },
          },
          entities: [
            {
              uuid: '02',
              name: 'Bar',
              meta: {},
              id: {
                uuid: '021',
                name: 'id',
                description: '',
                meta: {},
                access: 'public',
                type: 'Long',
              },
              properties: [],
              methods: [],
              __delta: {
                op: Delta.OP.OP_NEW,
                deltas: [],
              },
            },
          ],
          commands: [],
          __delta: {
            op: Delta.OP.OP_UPDATE,
            deltas: [
              {
                type: Delta.OP.OP_DELETE,
                key: 'root',
                value: {
                  uuid: '02',
                  name: 'Bar',
                  meta: {},
                  id: {
                    uuid: '021',
                    name: 'id',
                    description: '',
                    meta: {},
                    access: 'public',
                    type: 'Long',
                  },
                  properties: [],
                  methods: [],
                  __delta: {
                    op: Delta.OP.OP_DELETE,
                    deltas: [],
                  },
                },
              },
            ],
          },
        },
      ],
    };

    moveDetectForDomainModel(domain);

    // 标记为 new
    expect(domain.aggregates[0].entities?.[0]?.__delta?.op).toBe(Delta.OP.OP_MOVE | Delta.OP.OP_NEW);
    expect(domain.aggregates[0].root.__delta?.op).toBe(Delta.OP.OP_NEW);
    expect((domain.aggregates[0].__delta?.deltas[0] as Delta.PropertyDelete).value.__delta.op).toBe(
      Delta.OP.OP_DELETE | Delta.OP.OP_MOVE
    );
  });

  test('entities move to root', () => {
    const domain: DomainModelDSL = {
      aggregates: [
        {
          uuid: '1',
          name: '1',
          root: {
            uuid: '01',
            name: 'User',
            meta: {},
            id: {
              uuid: '011',
              name: 'id',
              description: '',
              meta: {},
              access: 'public',
              type: 'Long',
            },
            properties: [],
            methods: [],
            __delta: {
              op: Delta.OP.OP_NEW,
              deltas: [],
            },
          },
          entities: [
            {
              uuid: '02',
              name: 'Bar',
              meta: {},
              id: {
                uuid: '021',
                name: 'id',
                description: '',
                meta: {},
                access: 'public',
                type: 'Long',
              },
              properties: [],
              methods: [],
              __delta: {
                op: Delta.OP.OP_NEW,
                deltas: [],
              },
            },
            {
              uuid: '01',
              name: 'User',
              meta: {},
              id: {
                uuid: '011',
                name: 'id',
                description: '',
                meta: {},
                access: 'public',
                type: 'Long',
              },
              properties: [],
              methods: [],
              __delta: {
                op: Delta.OP.OP_DELETE,
                deltas: [],
              },
            },
          ],
          commands: [],
          __delta: {
            op: Delta.OP.OP_UPDATE,
            deltas: [
              {
                type: Delta.OP.OP_DELETE,
                key: 'root',
                value: {
                  uuid: '03',
                  name: 'Baz',
                  meta: {},
                  id: {
                    uuid: '031',
                    name: 'id',
                    description: '',
                    meta: {},
                    access: 'public',
                    type: 'Long',
                  },
                  properties: [],
                  methods: [],
                  __delta: {
                    op: Delta.OP.OP_DELETE,
                    deltas: [],
                  },
                },
              },
            ],
          },
        },
      ],
    };

    moveDetectForDomainModel(domain);
    expect(domain.aggregates[0].root.__delta?.op).toBe(Delta.OP.OP_NEW | Delta.OP.OP_MOVE);
    expect(domain.aggregates[0].entities?.[1].__delta?.op).toBe(Delta.OP.OP_DELETE | Delta.OP.OP_MOVE);
  });

  test('move between aggregation', () => {
    const domain: DomainModelDSL = {
      aggregates: [
        {
          uuid: '1',
          name: '1',
          root: {} as any,
          entities: [
            {
              uuid: '02',
              name: 'Bar',
              meta: {},
              id: {
                uuid: '021',
                name: 'id',
                description: '',
                meta: {},
                access: 'public',
                type: 'Long',
              },
              properties: [],
              methods: [],
              __delta: {
                op: Delta.OP.OP_NEW,
                deltas: [],
              },
            },
          ],
          commands: [],
        },
        {
          uuid: '2',
          name: '2',
          root: {} as any,
          entities: [
            {
              uuid: '02',
              name: 'Bar',
              meta: {},
              id: {
                uuid: '021',
                name: 'id',
                description: '',
                meta: {},
                access: 'public',
                type: 'Long',
              },
              properties: [],
              methods: [],
              __delta: {
                op: Delta.OP.OP_DELETE,
                deltas: [],
              },
            },
          ],
          commands: [],
        },
      ],
    };

    moveDetectForDomainModel(domain);

    expect(domain.aggregates[0].entities?.[0]?.__delta?.op).toBe(Delta.OP.OP_MOVE | Delta.OP.OP_NEW);
    expect(domain.aggregates[1].entities?.[0]?.__delta?.op).toBe(Delta.OP.OP_DELETE | Delta.OP.OP_MOVE);
  });
});

test('simple', () => {
  const sourceDomain: NormalizedBusinessDomainDSL = {
    uuid: 'simple',
    name: 'simple',
    version: '0.1.0',
    domainModel: {
      aggregates: [
        {
          uuid: '51d6a0f1-cfef-4723-9aae-2bed0ecf0e9d',
          title: '用户',
          name: 'User',
          meta: {},
          root: {
            uuid: '6c75e505-03d9-40aa-9961-bc5e37473da1',
            title: '用户',
            name: 'User',
            meta: {},
            id: {
              uuid: 'd5ac8416-5fe0-4407-b7d9-c22f207ab3bb',
              title: '用户 ID',
              name: 'id',
              description: '',
              meta: {},
              access: 'public',
              type: 'Long',
            },
            properties: [
              {
                uuid: '9ee1c90d-ac17-45be-897a-5757d1b5f9d7',
                title: '名称',
                name: 'name',
                description: '',
                meta: {},
                access: 'public',
                type: 'String',
              },
            ],
            methods: [],
          },
          entities: [],
          valueObjects: [],
          enums: [],
          commands: [
            {
              uuid: 'c89fb0b5-7604-4863-a754-af5a36d6e80f',
              title: '新增用户',
              name: 'UserCreate',
              description: '',
              meta: {},
              rules: [],
              category: 'create',
              repository: 'create',
              eventSendable: false,
              source: [{ type: 'http' }, { type: 'rpc' }],
              properties: [
                {
                  uuid: '1a925506-00f7-4aef-bcce-836215911c00',
                  title: '名称',
                  name: 'name',
                  description: '',
                  meta: {},
                  access: 'public',
                  type: 'String',
                },
              ],
              event: {
                uuid: 'c89fb0b5-7604-4863-a754-af5a36d6e80f',
                name: 'UserCreateEvent',
                properties: [
                  {
                    uuid: '1537b249-0aba-4177-8b76-93b1b4a7b535',
                    title: '用户 ID',
                    name: 'id',
                    description: '',
                    meta: {},
                    access: 'public',
                    type: 'Long',
                  },
                ],
              },
              return: { type: 'void' },
            },
            {
              uuid: 'e07d602b-b97a-492c-a46e-8798ff3bf8d0',
              title: '编辑用户',
              name: 'UserModify',
              description: '',
              meta: {},
              rules: [],
              category: 'modify',
              repository: 'modify',
              eventSendable: false,
              source: [{ type: 'http' }, { type: 'rpc' }],
              properties: [
                {
                  uuid: '30c6d04a-8ea0-466f-ab4e-d55d9e59d5d7',
                  title: '用户 ID',
                  name: 'id',
                  description: '',
                  meta: {},
                  access: 'public',
                  type: 'Long',
                },
                {
                  uuid: '39881d97-37e2-4f33-9220-24827e585aee',
                  title: '名称',
                  name: 'name',
                  description: '',
                  meta: {},
                  access: 'public',
                  type: 'String',
                },
              ],
              event: { uuid: 'e07d602b-b97a-492c-a46e-8798ff3bf8d0', name: 'UserModifyEvent', properties: [] },
              return: { type: 'void' },
            },
            {
              uuid: 'a69ea6f4-cc38-4597-b47e-51bf8081f5ea',
              title: '删除用户',
              name: 'UserRemove',
              description: '',
              meta: {},
              rules: [],
              category: 'remove',
              repository: 'remove',
              eventSendable: false,
              source: [{ type: 'http' }, { type: 'rpc' }],
              properties: [
                {
                  uuid: '25106aaf-6596-44bd-81f5-053a33f5d440',
                  title: '用户 ID',
                  name: 'id',
                  description: '',
                  meta: {},
                  access: 'public',
                  type: 'Long',
                },
              ],
              event: { uuid: 'a69ea6f4-cc38-4597-b47e-51bf8081f5ea', name: 'UserRemoveEvent', properties: [] },
              return: { type: 'void' },
            },
          ],
        },
      ],
    },
    queryModel: { queries: [], dtos: [] },
    dataModel: { dataObjects: [], references: [] },
    objectMapper: { mappers: [] },
    vision: '',
    ubiquitousLanguage: [
      {
        conception: '资源',
        englishName: 'Resource',
        definition: 'BD进行销售活动的对象',
        example: '',
        restraint: '',
        uuid: 'bf0b0ce7-6028-41d8-89d6-d096485f3f7d',
      },
      {
        conception: '公海',
        englishName: 'PublicSea',
        definition: '业务目标限定的模拟资源全集',
        example: '业务目标是团购买单合作，限定POI为到餐全国和综合58同城的',
        restraint: '与业务目标对应，比如交易公海是为了做交易，推广公海是为了推广',
        uuid: 'c9bae1d0-d028-418e-98f6-6a3990eec09a',
      },
    ],
  };
  const applicationSource: ApplicationDSL = {
    uuid: 'application',
    version: '1.0.0',
    name: '应用',
    businessDomains: [sourceDomain],
    businessScenarios: [],
  };

  // 没有任何变更
  expect(dslDelta(applicationSource, applicationSource)).toEqual(applicationSource);

  const newDomain: NormalizedBusinessDomainDSL = {
    uuid: 'simple',
    name: 'simple',
    version: '0.1.0',
    domainModel: {
      aggregates: [
        {
          uuid: '51d6a0f1-cfef-4723-9aae-2bed0ecf0e9d',
          title: '用户',
          name: 'User',
          meta: {},
          root: {
            uuid: '6c75e505-03d9-40aa-9961-bc5e37473da1',
            title: '用户',
            name: 'User',
            meta: {},
            id: {
              uuid: 'd5ac8416-5fe0-4407-b7d9-c22f207ab3bb',
              title: '用户 ID',
              name: 'id',
              description: '',
              meta: {},
              access: 'public',
              type: 'Long',
            },
            properties: [
              {
                uuid: '9ee1c90d-ac17-45be-897a-5757d1b5f9d7',
                title: '名称',
                name: 'name',
                description: '',
                meta: {},
                access: 'public',
                type: 'String',
              },
              {
                uuid: '5741d468-0056-4850-a11c-ba9d9c03b8e6',
                title: '未命名',
                name: 'age',
                description: '',
                meta: {},
                access: 'public',
                type: 'Integer',
              },
            ],
            methods: [],
          },
          entities: [
            {
              uuid: 'copy-407908de-4cdc-4076-9ec7-958295d9b3e8',
              title: '订单',
              name: 'Order',
              meta: {},
              id: {
                uuid: 'd5ac8416-5fe0-4407-b7d9-c22f207ab3bb',
                title: '用户 ID',
                name: 'id',
                description: '',
                meta: {},
                access: 'public',
                type: 'Long',
              },
              properties: [
                {
                  uuid: 'a59edff9-b80b-43a2-b65d-f1a359acee6c',
                  title: '订单名称',
                  name: 'orderId',
                  description: '',
                  meta: {},
                  access: 'public',
                  type: 'String',
                },
                {
                  uuid: '6159b563-a6f2-478f-864a-828bca126793',
                  title: '关联用户',
                  name: 'userId',
                  description: '',
                  meta: {},
                  access: 'public',
                  type: 'Long',
                },
              ],
              methods: [],
            },
          ],
          valueObjects: [],
          enums: [],
          commands: [
            {
              uuid: 'c89fb0b5-7604-4863-a754-af5a36d6e80f',
              title: '新增用户',
              name: 'UserCreate',
              description: '',
              meta: {},
              rules: [],
              category: 'create',
              repository: 'create',
              eventSendable: false,
              source: [{ type: 'http' }, { type: 'rpc' }],
              properties: [
                {
                  uuid: '1a925506-00f7-4aef-bcce-836215911c00',
                  title: '名称',
                  name: 'name',
                  description: '',
                  meta: {},
                  access: 'public',
                  type: 'String',
                },
              ],
              event: {
                uuid: 'c89fb0b5-7604-4863-a754-af5a36d6e80f',
                name: 'UserCreateEvent',
                properties: [
                  {
                    uuid: '1537b249-0aba-4177-8b76-93b1b4a7b535',
                    title: '用户 ID',
                    name: 'id',
                    description: '',
                    meta: {},
                    access: 'public',
                    type: 'Long',
                  },
                ],
              },
              return: { type: 'void' },
            },
            {
              uuid: 'e07d602b-b97a-492c-a46e-8798ff3bf8d0',
              title: '编辑用户',
              name: 'UserModify',
              description: '',
              meta: {},
              rules: [],
              category: 'modify',
              repository: 'modify',
              eventSendable: false,
              source: [{ type: 'http' }, { type: 'rpc' }],
              properties: [
                {
                  uuid: '30c6d04a-8ea0-466f-ab4e-d55d9e59d5d7',
                  title: '用户 ID',
                  name: 'id',
                  description: '',
                  meta: {},
                  access: 'public',
                  type: 'Long',
                },
                {
                  uuid: '39881d97-37e2-4f33-9220-24827e585aee',
                  title: '名称',
                  name: 'name',
                  description: '',
                  meta: {},
                  access: 'public',
                  type: 'String',
                },
              ],
              event: { uuid: 'e07d602b-b97a-492c-a46e-8798ff3bf8d0', name: 'UserModifyEvent', properties: [] },
              return: { type: 'void' },
            },
            {
              uuid: 'a69ea6f4-cc38-4597-b47e-51bf8081f5ea',
              title: '删除用户',
              name: 'UserRemove',
              description: '',
              meta: {},
              rules: [],
              category: 'remove',
              repository: 'remove',
              eventSendable: false,
              source: [{ type: 'http' }, { type: 'rpc' }],
              properties: [
                {
                  uuid: '25106aaf-6596-44bd-81f5-053a33f5d440',
                  title: '用户 ID',
                  name: 'id',
                  description: '',
                  meta: {},
                  access: 'public',
                  type: 'Long',
                },
              ],
              event: { uuid: 'a69ea6f4-cc38-4597-b47e-51bf8081f5ea', name: 'UserRemoveEvent', properties: [] },
              return: { type: 'void' },
            },
          ],
        },
      ],
    },
    queryModel: { queries: [], dtos: [] },
    dataModel: { dataObjects: [], references: [] },
    objectMapper: { mappers: [] },
    vision: '',
    ubiquitousLanguage: [
      {
        conception: '资源',
        englishName: 'Resource',
        definition: 'BD进行销售活动的对象',
        example: '',
        restraint: '',
        uuid: 'bf0b0ce7-6028-41d8-89d6-d096485f3f7d',
      },
      {
        conception: '公海',
        englishName: 'PublicSea',
        definition: '业务目标限定的模拟资源全集',
        example: '业务目标是团购买单合作，限定POI为到餐全国和综合58同城的',
        restraint: '与业务目标对应，比如交易公海是为了做交易，推广公海是为了推广',
        uuid: 'c9bae1d0-d028-418e-98f6-6a3990eec09a',
      },
    ],
  };

  const newApplicationSource: ApplicationDSL = {
    uuid: 'application',
    version: '1.0.0',
    name: '应用',
    businessDomains: [newDomain],
    businessScenarios: [],
  };

  expect(dslDelta(newApplicationSource, applicationSource)).toMatchSnapshot();
});
