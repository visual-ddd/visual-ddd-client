import { storeAutoBindingKey, autoBindThis } from './auto-bind-this';

describe('autoBindThis', () => {
  class Test {
    ok = 1;

    @storeAutoBindingKey
    foo() {
      return this.ok;
    }

    constructor() {
      autoBindThis(this);
    }
  }
  test('单类', () => {
    const test = new Test();
    const foo = test.foo;
    expect(foo()).toBe(1);
  });

  test('继承', () => {
    class Child extends Test {
      @storeAutoBindingKey
      bar() {
        return this.ok;
      }
    }

    const child = new Child();
    const foo = child.foo;
    const bar = child.bar;

    expect(foo()).toBe(1);
    expect(bar()).toBe(1);
  });
});
