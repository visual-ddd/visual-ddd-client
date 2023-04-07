import { parse, groupByTable } from './parser';

test('parse', () => {
  expect(parse('%%')).toBeNull();
  expect(parse('%%%%')).toBeNull();
  expect(parse('%% %%')).toBeNull();

  expect(parse('%%a%%')).toBeNull();

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
        notNull: true,
        table: 'MyUser',
        title: '创建时间',
        type: 'DateTime',
      },
      type: 'addField',
    },
    {
      params: {
        name: 'updatedAt',
        notNull: true,
        table: 'MyUser',
        title: '更新时间',
        type: 'DateTime',
      },
      type: 'addField',
    },
    {
      params: {
        name: 'createdAt',
        notNull: true,
        table: 'Address',
        title: '创建时间',
        type: 'DateTime',
      },
      type: 'addField',
    },
    {
      params: {
        name: 'updatedAt',
        notNull: true,
        table: 'Address',
        title: '更新时间',
        type: 'DateTime',
      },
      type: 'addField',
    },
  ]);
});

test('table name normalized', () => {
  expect(
    parse(`
%%createTable name="myUser" title="用户"%%
%%addField table="MyUser" name="CreatedAt" title="创建时间" type="DateTime" notNull="true"%%
%%addField table="MyUser" name="updated_at" title="更新时间" type="DateTime" notNull="true"%%
%%renameField table="MyUser" name="hello" newName="OK"%%
%%renameTable name="MyUser" newName="account" %%
  `)
  ).toEqual([
    {
      params: {
        name: 'MyUser',
        title: '用户',
      },
      type: 'createTable',
    },
    {
      params: {
        name: 'createdAt',
        notNull: true,
        table: 'MyUser',
        title: '创建时间',
        type: 'DateTime',
      },
      type: 'addField',
    },
    {
      params: {
        name: 'updatedAt',
        notNull: true,
        table: 'MyUser',
        title: '更新时间',
        type: 'DateTime',
      },
      type: 'addField',
    },
    {
      params: {
        name: 'hello',
        newName: 'ok',
        table: 'MyUser',
      },
      type: 'renameField',
    },
    {
      params: {
        name: 'MyUser',
        newName: 'Account',
      },
      type: 'renameTable',
    },
  ]);
});

describe('groupByTable', () => {
  test('simple', () => {
    expect(
      groupByTable(
        parse(`
%%createTable name="Product" title="商品"%%
%%createTable name="Order" title="订单"%%

%%addField table="Product" name="id" title="商品id" type="Long" primaryKey="true" notNull="true"%%
%%addField table="Product" name="name" title="商品名" type="String" notNull="true"%%
%%addField table="Product" name="price" title="价格" type="Decimal" notNull="true"%%
%%addField table="Product" name="description" title="描述" type="LongText" notNull="true"%%

%%addField table="Order" name="id" title="订单id" type="Long" primaryKey="true" notNull="true"%%
%%addField table="Order" name="productId" title="商品引用" type="Reference" reference="Product.id" referenceCardinality="ManyToOne" notNull="true"%%
%%addField table="Order" name="quantity" title="数量" type="Integer" notNull="true"%%
%%addField table="Order" name="totalPrice" title="总价" type="Decimal" notNull="true"%%

  `)!
      )
    ).toMatchSnapshot();
  });

  test('table renamed', () => {
    expect(
      groupByTable(
        parse(`
%%renameTable name="Product" newName="Good"%%
%%createTable name="Order" title="订单"%%

%%addField table="Product" name="id" title="商品id" type="Long" primaryKey="true" notNull="true"%%
%%addField table="Product" name="name" title="商品名" type="String" notNull="true"%%
%%addField table="Good" name="price" title="价格" type="Decimal" notNull="true"%%
%%addField table="Good" name="description" title="描述" type="LongText" notNull="true"%%

%%addField table="Order" name="id" title="订单id" type="Long" primaryKey="true" notNull="true"%%
%%renameField table="Order" name="id" newName="orderNo" %%
%%addField table="Order" name="productId" title="商品引用" type="Reference" reference="Product.id" referenceCardinality="ManyToOne" notNull="true"%%
%%addField table="Order" name="quantity" title="数量" type="Integer" notNull="true"%%
%%addField table="Order" name="totalPrice" title="总价" type="Decimal" notNull="true"%%
%%updateField table="Order" name="id" title="订单编号" %%
%%updateField table="Order" name="orderNo" type="String" %%

  `)!
      )
    ).toMatchSnapshot();
  });
});
