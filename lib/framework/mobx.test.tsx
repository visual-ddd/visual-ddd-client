/**
 * @jest-environment jsdom
 */
import React from 'react';
import { observable, runInAction } from 'mobx';
import { observer } from 'mobx-react';
import { cleanup, render, act } from '@testing-library/react';
import '@testing-library/jest-dom';

afterEach(cleanup);

test('类组件可以响应 mobx 响应式数据的变动', () => {
  const count = observable({ value: 1 });

  @observer
  class Foo extends React.Component {
    override render() {
      return <div id="count">{count.value}</div>;
    }
  }

  const { container } = render(<Foo />);
  const countElement = container.querySelector('#count');

  expect(countElement?.textContent).toBe('1');

  act(() => {
    runInAction(() => {
      count.value++;
    });
  });

  expect(countElement?.textContent).toBe('2');
});
