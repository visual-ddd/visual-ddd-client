import { Executor } from './executor';
import { parse } from './parser';

test('execute', () => {
  const directives = parse(`
%%Start x="100" y="100"%% %%Node name="Input" label="填写账号密码" x="250" y="100"%% %%Condition name="VerifyInput" label="信息是否填写完整" x="400" y="100"%% %%Condition name="VerifyAccount" label="账号密码是否正确" x="400" y="200"%% %%Node name="LoginSuccess" label="登录成功" x="550" y="50"%% %%Node name="LoginFailed" label="登录失败" x="550" y="250"%% %%Edge from="Start" to="Input"%% %%Edge from="Input" to="VerifyInput"%% %%Edge from="VerifyInput" to="VerifyAccount" label="是"%% %%Edge from="VerifyInput" to="LoginFailed" label="否"%% %%Edge from="VerifyAccount" to="LoginSuccess" label="是"%% %%Edge from="VerifyAccount" to="LoginFailed" label="否"%% %%End x="700" y="150"%%
	`);
  const exec = jest.fn();
  const executor = new Executor({
    store: {
      createNode: exec,
    },
  });

  executor.execute(directives!);
  expect(executor.warning).toEqual([]);
  expect(exec.mock.calls).toEqual([
    [
      {
        params: {
          x: expect.any(Number),
          y: expect.any(Number),
        },
        type: 'Start',
      },
    ],
    [
      {
        params: {
          label: '填写账号密码',
          name: 'Input',
          x: expect.any(Number),
          y: expect.any(Number),
        },
        type: 'Node',
      },
    ],
    [
      {
        params: {
          label: '信息是否填写完整',
          name: 'VerifyInput',
          x: expect.any(Number),
          y: expect.any(Number),
        },
        type: 'Condition',
      },
    ],
    [
      {
        params: {
          label: '账号密码是否正确',
          name: 'VerifyAccount',

          x: expect.any(Number),
          y: expect.any(Number),
        },
        type: 'Condition',
      },
    ],
    [
      {
        params: {
          label: '登录成功',
          name: 'LoginSuccess',

          x: expect.any(Number),
          y: expect.any(Number),
        },
        type: 'Node',
      },
    ],
    [
      {
        params: {
          label: '登录失败',
          name: 'LoginFailed',
          x: expect.any(Number),
          y: expect.any(Number),
        },
        type: 'Node',
      },
    ],
    [
      {
        params: {
          x: expect.any(Number),
          y: expect.any(Number),
        },
        type: 'End',
      },
    ],
    [
      {
        params: {
          from: 'Start',
          to: 'Input',
        },
        type: 'Edge',
      },
    ],
    [
      {
        params: {
          from: 'Input',
          to: 'VerifyInput',
        },
        type: 'Edge',
      },
    ],
    [
      {
        params: {
          from: 'VerifyInput',
          label: '是',
          to: 'VerifyAccount',
        },
        type: 'Edge',
      },
    ],
    [
      {
        params: {
          from: 'VerifyInput',
          label: '否',
          to: 'LoginFailed',
        },
        type: 'Edge',
      },
    ],
    [
      {
        params: {
          from: 'VerifyAccount',
          label: '是',
          to: 'LoginSuccess',
        },
        type: 'Edge',
      },
    ],
    [
      {
        params: {
          from: 'VerifyAccount',
          label: '否',
          to: 'LoginFailed',
        },
        type: 'Edge',
      },
    ],
  ]);
});
