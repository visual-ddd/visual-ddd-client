/**
 * 集成测试
 */
import { injectable, inject, configureDI, getInject } from '.';

jest.mock('./polyfill.ts', () => ({}));
jest.mock('./initialize.ts', () => ({ initialize: jest.fn() }));

declare global {
  interface DIMapper {
    'DI.Bar': Bar;
    'DI.Foo': Foo;
  }
}

@injectable()
class Bar {}

@injectable()
class Foo {
  @inject('DI.Bar')
  bar!: Bar;
}

configureDI(({ registerClass }) => {
  registerClass('DI.Foo', Foo);
  registerClass('DI.Bar', Bar);
});

test('api-test', () => {
  const foo = getInject('DI.Foo');
  expect(foo).not.toBeUndefined();
});
