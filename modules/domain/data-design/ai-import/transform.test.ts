import { transform } from './transform';
import * as mockedUuid from 'uuid';

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

beforeEach(() => {
  mockedUuidModule.reset();
});

test('transform', () => {
  expect(
    transform([
      {
        name: 'User',
        title: '用户',
        properties: [
          { name: 'id', title: '用户唯一id', primaryKey: true, type: { type: 'Long' } },
          { name: 'name', title: '用户名', type: { type: 'String' } },
        ],
      },
      {
        name: 'Asset',
        title: '资产',
        properties: [
          { name: 'id', title: '唯一id', primaryKey: true, type: { type: 'Long' } },
          { name: 'name', title: '资产名称', type: { type: 'String' } },
          { name: 'value', title: '资产价值', type: { type: 'Decimal' } },
          {
            name: 'userId',
            title: '用户引用',
            type: { type: 'Reference', target: 'User', property: 'id', cardinality: 'OneToMany' },
          },
        ],
      },
    ] as any)
  ).toMatchSnapshot();

  expect(() => {
    transform([
      {
        name: 'User',
        title: '用户',
        properties: [
          { name: 'id', title: '用户唯一id', primaryKey: true, type: { type: 'Long' } },
          { name: 'name', title: '用户名', type: { type: 'String' } },
        ],
      },
      {
        name: 'Asset',
        title: '资产',
        properties: [
          { name: 'id', title: '唯一id', primaryKey: true, type: { type: 'Long' } },
          { name: 'name', title: '资产名称', type: { type: 'String' } },
          { name: 'value', title: '资产价值', type: { type: 'Decimal' } },
          {
            name: 'userId',
            title: '用户引用',
            type: { type: 'Reference', target: 'User', property: 'unknown', cardinality: 'OneToMany' },
          },
        ],
      },
    ] as any);
  }).toThrowError('引用类型解析错误, 未找到字段 User.unknown');
});
