import React from 'react';
import { Container, configureDI } from '@wakeapp/framework-core';
import { registerComponent, overrideComponent } from './methods';

describe('依赖注册方法', () => {
  const MockIdentifier: any = 'MOCK_IDENTIFIER';
  const container = new Container();
  const Comp = () => React.createElement('div');

  afterEach(() => {
    container.unbindAll();

    // 重置注册状态
    // @ts-expect-error
    container.__LAST_REGISTERED_DEPS__ = {};
  });

  test('registerComponent', () => {
    registerComponent(MockIdentifier, Comp, { container });

    const component = container.get(MockIdentifier);
    expect(component).toBe(Comp);

    // 不能重复注册
    expect(() => {
      registerComponent(MockIdentifier, Comp, { container });
    }).toThrowError('MOCK_IDENTIFIER 组件已经注册过');

    // 可以覆盖
    const Comp2 = () => React.createElement('span');
    overrideComponent(MockIdentifier, Comp2, { container });
    expect(container.get(MockIdentifier)).toBe(Comp2);
  });

  test('registerComponent By configureDI', () => {
    configureDI(({ registerComponent }) => {
      registerComponent(MockIdentifier, Comp);
    }, container);

    const component = container.get(MockIdentifier);
    expect(component).toBe(Comp);
  });
});
