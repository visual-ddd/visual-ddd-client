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
  const doc = createDoc();

  expect(doc.toJSON()).toMatchSnapshot();
});
