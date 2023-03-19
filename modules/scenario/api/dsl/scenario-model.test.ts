import { ScenarioModelContainer } from './scenario-model';

const DATA = {
  'db3c8f35-3815-476d-a7fb-a9cfeb9aed52': {
    __NODE__: true,
    id: 'db3c8f35-3815-476d-a7fb-a9cfeb9aed52',
    parent: '86a19e0b-bccc-4a62-8276-d33d24e79c1f',
    children: {},
    properties: {
      __node_name__: 's-start',
      __node_type__: 'node',
      position: { x: 246.5, y: 46 },
      __PROPERTY__: true,
      size: { width: 45, height: 45 },
    },
  },
  '86a19e0b-bccc-4a62-8276-d33d24e79c1f': {
    __NODE__: true,
    id: '86a19e0b-bccc-4a62-8276-d33d24e79c1f',
    parent: '__ROOT__',
    children: {
      'db3c8f35-3815-476d-a7fb-a9cfeb9aed52': 1,
      '25c2945e-8e87-4506-8f3d-dfb95194ac19': 1,
      '180fece3-2b9b-48bd-921f-fd2a4c4f6df2': 1,
      'copy-8a849cfc-1b2c-4ba2-82b2-423b8ce36b85': 1,
      '2be646a0-6a4f-4978-8701-035cbad04648': 1,
      'bc4442af-6595-48be-9465-20f648a69532': 1,
      '238b8854-ecad-4773-8d07-f6e46607d3de': 1,
      'f1b36dd7-7da9-4d93-ace1-a6b74615286c': 1,
      '66cc4e6e-b920-4b86-bd77-d843ba87d6b1': 1,
      'd2e018a1-8bb9-470e-8e7a-7bf4d2fcd1ce': 1,
      'efd77db0-e54a-47a9-b141-c9501465c51b': 1,
      '794acb65-50f2-4a25-bf9c-a41952eadef4': 1,
      '743d9b5c-a234-42fd-9f38-653b230a640e': 1,
    },
    properties: {
      __node_name__: 's-lane',
      __node_type__: 'node',
      position: { x: 10, y: 10 },
      uuid: '86a19e0b-bccc-4a62-8276-d33d24e79c1f',
      name: 'lane',
      title: '泳道',
      description: '',
      meta: [],
      width: 1200,
      panes: [
        { uuid: 'efafd6fb-1999-4fa1-82d0-93e51811e695', title: '未命名泳道', height: 335 },
        { uuid: 'f0953043-52a8-4c85-94a8-6d85ba780adf', title: '未命名泳道', height: 300 },
      ],
      __PROPERTY__: true,
      size: { width: 1200, height: 635 },
    },
  },
  '25c2945e-8e87-4506-8f3d-dfb95194ac19': {
    __NODE__: true,
    id: '25c2945e-8e87-4506-8f3d-dfb95194ac19',
    parent: '86a19e0b-bccc-4a62-8276-d33d24e79c1f',
    children: {},
    properties: {
      __node_name__: 's-edge',
      __node_type__: 'edge',
      source: { cell: 'db3c8f35-3815-476d-a7fb-a9cfeb9aed52', port: 'right' },
      target: { cell: '180fece3-2b9b-48bd-921f-fd2a4c4f6df2' },
      __PROPERTY__: true,
    },
  },
  __ROOT__: {
    __NODE__: true,
    id: '__ROOT__',
    children: { '86a19e0b-bccc-4a62-8276-d33d24e79c1f': 1 },
    properties: { __node_name__: '__ROOT__', __node_type__: 'node', __PROPERTY__: true },
  },
  '180fece3-2b9b-48bd-921f-fd2a4c4f6df2': {
    __NODE__: true,
    id: '180fece3-2b9b-48bd-921f-fd2a4c4f6df2',
    parent: '86a19e0b-bccc-4a62-8276-d33d24e79c1f',
    children: {},
    properties: {
      __node_name__: 's-activity',
      __node_type__: 'node',
      position: { x: 169, y: 173 },
      uuid: '180fece3-2b9b-48bd-921f-fd2a4c4f6df2',
      name: 'activity6df25425',
      title: '绑定多个业务域服务',
      description: '',
      meta: [],
      binding: {
        type: 'domainService',
        domainId: 32,
        versionId: 60,
        domainServiceId: ['51772af6-eb77-4ebe-82d5-53edcb7fe82c', '93a15900-45d9-4804-a9e0-bf31a16009c0'],
      },
      __PROPERTY__: true,
      size: { width: 200, height: 51.421875 },
    },
  },
  'copy-8a849cfc-1b2c-4ba2-82b2-423b8ce36b85': {
    __NODE__: true,
    id: 'copy-8a849cfc-1b2c-4ba2-82b2-423b8ce36b85',
    parent: '86a19e0b-bccc-4a62-8276-d33d24e79c1f',
    children: {},
    properties: {
      __node_name__: 's-activity',
      __node_type__: 'node',
      uuid: 'copy-8a849cfc-1b2c-4ba2-82b2-423b8ce36b85',
      name: 'activityde5b0793',
      title: '绑定多个业务域服务',
      description: '',
      meta: [],
      binding: {
        type: 'domainService',
        domainId: 32,
        versionId: 60,
        domainServiceId: '93a15900-45d9-4804-a9e0-bf31a16009c0',
      },
      position: { x: 169, y: 388 },
      __PROPERTY__: true,
      size: { width: 200, height: 51.421875 },
    },
  },
  '2be646a0-6a4f-4978-8701-035cbad04648': {
    __NODE__: true,
    id: '2be646a0-6a4f-4978-8701-035cbad04648',
    parent: '86a19e0b-bccc-4a62-8276-d33d24e79c1f',
    children: {},
    properties: {
      __node_name__: 's-edge',
      __node_type__: 'edge',
      source: { cell: '180fece3-2b9b-48bd-921f-fd2a4c4f6df2', port: 'right' },
      target: { cell: 'copy-8a849cfc-1b2c-4ba2-82b2-423b8ce36b85' },
      __PROPERTY__: true,
    },
  },
  'bc4442af-6595-48be-9465-20f648a69532': {
    __NODE__: true,
    id: 'bc4442af-6595-48be-9465-20f648a69532',
    parent: '86a19e0b-bccc-4a62-8276-d33d24e79c1f',
    children: {},
    properties: {
      __node_name__: 's-end',
      __node_type__: 'node',
      position: { x: 246.5, y: 546 },
      zIndex: 1,
      __PROPERTY__: true,
      size: { width: 45, height: 45 },
    },
  },
  '238b8854-ecad-4773-8d07-f6e46607d3de': {
    __NODE__: true,
    id: '238b8854-ecad-4773-8d07-f6e46607d3de',
    parent: '86a19e0b-bccc-4a62-8276-d33d24e79c1f',
    children: {},
    properties: {
      __node_name__: 's-edge',
      __node_type__: 'edge',
      source: { cell: 'copy-8a849cfc-1b2c-4ba2-82b2-423b8ce36b85', port: 'right' },
      target: { cell: 'bc4442af-6595-48be-9465-20f648a69532' },
      __PROPERTY__: true,
    },
  },
  'f1b36dd7-7da9-4d93-ace1-a6b74615286c': {
    __NODE__: true,
    id: 'f1b36dd7-7da9-4d93-ace1-a6b74615286c',
    parent: '86a19e0b-bccc-4a62-8276-d33d24e79c1f',
    children: {},
    properties: {
      __node_name__: 's-decision',
      __node_type__: 'node',
      position: { x: 505, y: 161.2109375 },
      uuid: 'f1b36dd7-7da9-4d93-ace1-a6b74615286c',
      name: 'decision286c1401',
      title: '决策',
      description: '',
      meta: [],
      __PROPERTY__: true,
      size: { width: 75, height: 75 },
    },
  },
  '66cc4e6e-b920-4b86-bd77-d843ba87d6b1': {
    __NODE__: true,
    id: '66cc4e6e-b920-4b86-bd77-d843ba87d6b1',
    parent: '86a19e0b-bccc-4a62-8276-d33d24e79c1f',
    children: {},
    properties: {
      __node_name__: 's-edge',
      __node_type__: 'edge',
      source: { cell: '180fece3-2b9b-48bd-921f-fd2a4c4f6df2', port: 'right' },
      target: { cell: 'f1b36dd7-7da9-4d93-ace1-a6b74615286c', port: 'left' },
      __PROPERTY__: true,
    },
  },
  'd2e018a1-8bb9-470e-8e7a-7bf4d2fcd1ce': {
    __NODE__: true,
    id: 'd2e018a1-8bb9-470e-8e7a-7bf4d2fcd1ce',
    parent: '86a19e0b-bccc-4a62-8276-d33d24e79c1f',
    children: {},
    properties: {
      __node_name__: 's-activity',
      __node_type__: 'node',
      position: { x: 442.5, y: 388 },
      uuid: 'd2e018a1-8bb9-470e-8e7a-7bf4d2fcd1ce',
      name: 'activityd1ce6483',
      title: '绑定业务场景',
      description: '',
      meta: [],
      binding: { type: 'scenarioService' },
      __PROPERTY__: true,
      size: { width: 200, height: 51.421875 },
    },
  },
  '743d9b5c-a234-42fd-9f38-653b230a640e': {
    __NODE__: true,
    id: '743d9b5c-a234-42fd-9f38-653b230a640e',
    parent: '86a19e0b-bccc-4a62-8276-d33d24e79c1f',
    children: {},
    properties: {
      __node_name__: 's-activity',
      __node_type__: 'node',
      position: { x: 442.5, y: 388 },
      uuid: 'fd6999cf-0f12-44ea-9341-e0bc72465c8d',
      name: 'activitye0bc72465c8d',
      title: '绑定外部服务',
      description: '',
      meta: [],
      binding: { type: 'externalService', serviceName: 'name', serviceDescription: 'description' },
      __PROPERTY__: true,
      size: { width: 200, height: 51.421875 },
    },
  },
  'efd77db0-e54a-47a9-b141-c9501465c51b': {
    __NODE__: true,
    id: 'efd77db0-e54a-47a9-b141-c9501465c51b',
    parent: '86a19e0b-bccc-4a62-8276-d33d24e79c1f',
    children: {},
    properties: {
      __node_name__: 's-label-edge',
      __node_type__: 'edge',
      zIndex: 1,
      uuid: '0bf9901a-faa4-4729-8cb3-6457c5fa72a6',
      label: '标签',
      source: { cell: 'f1b36dd7-7da9-4d93-ace1-a6b74615286c', port: 'right' },
      target: { cell: 'd2e018a1-8bb9-470e-8e7a-7bf4d2fcd1ce' },
      __PROPERTY__: true,
    },
  },
  '794acb65-50f2-4a25-bf9c-a41952eadef4': {
    __NODE__: true,
    id: '794acb65-50f2-4a25-bf9c-a41952eadef4',
    parent: '86a19e0b-bccc-4a62-8276-d33d24e79c1f',
    children: {},
    properties: {
      __node_name__: 's-edge',
      __node_type__: 'edge',
      source: { cell: 'd2e018a1-8bb9-470e-8e7a-7bf4d2fcd1ce', port: 'right' },
      target: { cell: 'bc4442af-6595-48be-9465-20f648a69532' },
      __PROPERTY__: true,
    },
  },
};

test('scenario-model', () => {
  const container = new ScenarioModelContainer(DATA as any);

  expect(container.toDSL()).toMatchSnapshot();
});
