import { parse } from './parser';

test('parse', () => {
  expect(parse('%%')).toBeNull();
  expect(parse('%%%%')).toBeNull();
  expect(parse('%% %%')).toBeNull();

  expect(parse('%%a%%')).toEqual([{ params: {}, type: 'a' }]);

  expect(parse(` %%renameField table="MyUser" name="name" newName="oName" %% `)).toEqual([
    {
      params: {
        name: 'name',
        newName: 'oName',
        table: 'MyUser',
      },
      type: 'renameField',
    },
  ]);

  expect(
    parse(`
%%addField table="MyUser" name="createdAt" title="创建时间" type="DateTime" notNull="true"%%
%%addField table="MyUser" name="updatedAt" title="更新时间" type="DateTime" notNull="true"%%

%%addField table="Address" name="createdAt" title="创建时间" type="DateTime" notNull="true"%%
%%addField table="Address" name="updatedAt" title="更新时间" type="DateTime" notNull="true"%%
	`)
  ).toEqual([
    {
      params: {
        name: 'createdAt',
        notNull: 'true',
        table: 'MyUser',
        title: '创建时间',
        type: 'DateTime',
      },
      type: 'addField',
    },
    {
      params: {
        name: 'updatedAt',
        notNull: 'true',
        table: 'MyUser',
        title: '更新时间',
        type: 'DateTime',
      },
      type: 'addField',
    },
    {
      params: {
        name: 'createdAt',
        notNull: 'true',
        table: 'Address',
        title: '创建时间',
        type: 'DateTime',
      },
      type: 'addField',
    },
    {
      params: {
        name: 'updatedAt',
        notNull: 'true',
        table: 'Address',
        title: '更新时间',
        type: 'DateTime',
      },
      type: 'addField',
    },
  ]);

  expect(
    parse(`
%%Start x="100" y="100"%% %%Node name="Input" label="填写账号密码" x="250" y="100"%% %%Condition name="VerifyInput" label="信息是否填写完整" x="400" y="100"%% %%Condition name="VerifyAccount" label="账号密码是否正确" x="400" y="200"%% %%Node name="LoginSuccess" label="登录成功" x="550" y="50"%% %%Node name="LoginFailed" label="登录失败" x="550" y="250"%% %%Edge from="Start" to="Input"%% %%Edge from="Input" to="VerifyInput"%% %%Edge from="VerifyInput" to="VerifyAccount" label="是"%% %%Edge from="VerifyInput" to="LoginFailed" label="否"%% %%Edge from="VerifyAccount" to="LoginSuccess" label="是"%% %%Edge from="VerifyAccount" to="LoginFailed" label="否"%% %%End x="700" y="150"%%
  `)
  ).toEqual([
    {
      params: {
        x: '100',
        y: '100',
      },
      type: 'Start',
    },
    {
      params: {
        label: '填写账号密码',
        name: 'Input',
        x: '250',
        y: '100',
      },
      type: 'Node',
    },
    {
      params: {
        label: '信息是否填写完整',
        name: 'VerifyInput',
        x: '400',
        y: '100',
      },
      type: 'Condition',
    },
    {
      params: {
        label: '账号密码是否正确',
        name: 'VerifyAccount',
        x: '400',
        y: '200',
      },
      type: 'Condition',
    },
    {
      params: {
        label: '登录成功',
        name: 'LoginSuccess',
        x: '550',
        y: '50',
      },
      type: 'Node',
    },
    {
      params: {
        label: '登录失败',
        name: 'LoginFailed',
        x: '550',
        y: '250',
      },
      type: 'Node',
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
        from: 'VerifyInput',
        label: '是',
        to: 'VerifyAccount',
      },
      type: 'Edge',
    },
    {
      params: {
        from: 'VerifyInput',
        label: '否',
        to: 'LoginFailed',
      },
      type: 'Edge',
    },
    {
      params: {
        from: 'VerifyAccount',
        label: '是',
        to: 'LoginSuccess',
      },
      type: 'Edge',
    },
    {
      params: {
        from: 'VerifyAccount',
        label: '否',
        to: 'LoginFailed',
      },
      type: 'Edge',
    },
    {
      params: {
        x: '700',
        y: '150',
      },
      type: 'End',
    },
  ]);
});
