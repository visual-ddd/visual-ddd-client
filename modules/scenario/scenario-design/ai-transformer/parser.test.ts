import { parse } from './parser';

test('parse', () => {
  expect(
    parse(`
%%Start x="100" y="100"%%
%%Node name="Input" label="填写信息" x="250" y="100"%%
%%Condition name="VerifyInput" label="信息是否填写完整" x="400" y="100"%%
%%Edge from="Start" to="Input"%%
%%Edge from="Input" to="VerifyInput"%%
%%Node name="Submit" label="提交" x="550" y="50"%%
%%Node name="Error" label="显示错误信息" x="550" y="150"%%
%%Edge from="VerifyInput" to="Submit" label="是"%%
%%Edge from="VerifyInput" to="Error" label="否"%%
%%Edge from="Submit" to="End"%%
%%Edge from="Error" to="End"%%
%%End x="700" y="100"%%
	`)
  ).toEqual([
    {
      params: {
        x: 100,
        y: 100,
      },
      type: 'Start',
    },
    {
      params: {
        label: '填写信息',
        name: 'Input',
        x: 250,
        y: 100,
      },
      type: 'Node',
    },
    {
      params: {
        label: '信息是否填写完整',
        name: 'VerifyInput',
        x: 400,
        y: 100,
      },
      type: 'Condition',
    },
    {
      params: {
        from: 'Start',
        to: 'Input',
      },
      type: 'Edge',
    },
    {
      params: {
        from: 'Input',
        to: 'VerifyInput',
      },
      type: 'Edge',
    },
    {
      params: {
        label: '提交',
        name: 'Submit',
        x: 550,
        y: 50,
      },
      type: 'Node',
    },
    {
      params: {
        label: '显示错误信息',
        name: 'Error',
        x: 550,
        y: 150,
      },
      type: 'Node',
    },
    {
      params: {
        from: 'VerifyInput',
        label: '是',
        to: 'Submit',
      },
      type: 'Edge',
    },
    {
      params: {
        from: 'VerifyInput',
        label: '否',
        to: 'Error',
      },
      type: 'Edge',
    },
    {
      params: {
        from: 'Submit',
        to: 'End',
      },
      type: 'Edge',
    },
    {
      params: {
        from: 'Error',
        to: 'End',
      },
      type: 'Edge',
    },
    {
      params: {
        x: 700,
        y: 100,
      },
      type: 'End',
    },
  ]);
});
