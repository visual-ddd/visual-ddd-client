import { createDataObjectDSL, createDataObjectIndexDSL, createDataObjectPropertyDSL } from '../dsl/factory';
import { DataObjectPropertyDSL, DataObjectReference, DataObjectString, DataObjectTypeName } from '../dsl/dsl';
import { transform } from './transform';

describe('transform', () => {
  const inString = createDataObjectPropertyDSL(DataObjectTypeName.String);
  inString.name = 'inString';
  inString.title = '字符串';
  (inString.type as DataObjectString).defaultValue = 'hello';

  const inInteger = createDataObjectPropertyDSL(DataObjectTypeName.Integer);
  inInteger.name = 'inInteger';
  inInteger.title = '整数';

  const inPrimaryKey = createDataObjectPropertyDSL(DataObjectTypeName.Long);
  inPrimaryKey.name = 'inPrimaryKey';
  inPrimaryKey.title = '主键';
  inPrimaryKey.primaryKey = true;

  const inNotNull = createDataObjectPropertyDSL(DataObjectTypeName.Date);
  inNotNull.name = 'inNotNull';
  inNotNull.title = '非空';
  inNotNull.notNull = true;

  const customPropertyName = createDataObjectPropertyDSL(DataObjectTypeName.String);
  customPropertyName.name = 'customPropertyName';
  customPropertyName.title = '自定义属性名';
  customPropertyName.propertyName = 'my_name';

  test('simpleTable', () => {
    const t = createDataObjectDSL();
    t.name = 'MyTable';
    t.title = '我的表格';
    t.properties = [];
    t.properties.push(inPrimaryKey, inString, inInteger, inNotNull, customPropertyName);

    expect(transform([t], [t])).toMatchSnapshot();

    // for conception
    expect(transform([t], [t], { useCase: 'conception' })).toMatchSnapshot();
  });

  test('index', () => {
    const t = createDataObjectDSL();
    t.name = 'MyTable';
    t.properties = [];
    t.properties.push(inPrimaryKey, inString, inInteger, inNotNull, customPropertyName);

    const index = createDataObjectIndexDSL();
    index.name = 'MyIndex';
    index.properties = [inPrimaryKey.uuid, inString.uuid];

    const emptyIndex = createDataObjectIndexDSL();
    emptyIndex.name = 'EmptyIndex';

    t.indexes = [index, emptyIndex];

    expect(transform([t], [t])).toMatchSnapshot();
  });

  test('tableReference', () => {
    const a = createDataObjectDSL();
    a.name = 'A';
    a.properties = [inPrimaryKey, inString];

    const b = createDataObjectDSL();
    const ref = createDataObjectPropertyDSL(DataObjectTypeName.Reference) as DataObjectPropertyDSL<DataObjectReference>;
    ref.type.target = a.uuid;
    ref.type.targetProperty = inPrimaryKey.uuid;

    b.properties = [inPrimaryKey, ref];

    expect(transform([a, b], [a, b])).toMatchSnapshot();
  });
});
