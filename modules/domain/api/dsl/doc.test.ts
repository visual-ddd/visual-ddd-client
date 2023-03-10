import { createDoc } from './doc';
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

test('createDoc', () => {
  const doc = createDoc({ name: 'Hello', title: '你好', description: '你好世界' });

  expect(doc.toJSON()).toMatchSnapshot();
});
