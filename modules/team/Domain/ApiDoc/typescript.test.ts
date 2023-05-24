import { ObjectType } from './extra-api';
import { toTypescript, replaceType } from './typescript';

describe('replaceType', () => {
  it('should replace BaseType with corresponding TypeScript type', () => {
    expect(replaceType('String')).toBe('string');
    expect(replaceType('Integer')).toBe('number');
    expect(replaceType('Long')).toBe('number');
    expect(replaceType('Double')).toBe('number');
    expect(replaceType('Float')).toBe('number');
    expect(replaceType('Date')).toBe('Date');
    expect(replaceType('Boolean')).toBe('boolean');
    expect(replaceType('BigDecimal')).toBe('number');
    expect(replaceType('Char')).toBe('string');
    expect(replaceType('Byte')).toBe('number');
    expect(replaceType('Short')).toBe('number');
    expect(replaceType('Void')).toBe('void');
    expect(replaceType('List')).toBe('Array');
    expect(replaceType('Map')).toBe('Map');
    expect(replaceType('Set')).toBe('Set');

    expect(replaceType('Set<string>')).toBe('Set<string>');
    expect(replaceType('Set<String, Char>')).toBe('Set<string, string>');
    expect(replaceType('Map<Boolean, Date>')).toBe('Map<boolean, Date>');
  });

  it('should not replace typescript types', () => {
    expect(replaceType('MyCustomType')).toBe('MyCustomType');
    expect(replaceType('List<MyCustomType>')).toBe('Array<MyCustomType>');
    expect(replaceType('Set<MyCustomType, String>')).toBe('Set<MyCustomType, string>');
  });
});

describe('toTypescript', () => {
  test('enum', () => {
    expect(
      toTypescript(
        {
          uuid: '1',
          title: '枚举',
          description: '描述描述',
          name: 'MyEnum',
          type: ObjectType.Enum,
          properties: [
            {
              uuid: '2',
              title: '枚举1',
              description: '描述描述',
              name: 'Member1',
              // @ts-expect-error
              code: 1,
            },
            {
              uuid: '3',
              name: 'Member2',
              // @ts-expect-error
              code: 2,
            },
          ],
        },
        {}
      )
    ).toBe(`/**
 * 枚举
 * 描述描述
 */
enum MyEnum {
  /**
   * 枚举1
   * 描述描述
   */
  Member1 = 1,
  Member2 = 2,
}`);
  });

  test('interface', () => {
    expect(
      toTypescript(
        {
          uuid: '1',
          title: '接口',
          description: '描述描述',
          name: 'MyInterface',
          type: ObjectType.Command,
          properties: [
            {
              uuid: '2',
              title: '属性1',
              description: '描述描述',
              name: 'prop1',
              type: 'string',
              optional: false,
            },
            {
              uuid: '3',
              title: '属性2',
              description: '描述描述',
              name: 'prop2',
              type: 'string',
              optional: true,
            },
          ],
        },
        {}
      )
    ).toBe(`/**
 * 接口
 * 描述描述
 */
interface MyInterface {
  /**
   * 属性1
   * 描述描述
   */
  prop1: string;
  /**
   * 属性2
   * 描述描述
   */
  prop2?: string;
}`);

    // 引用类型
    expect(
      toTypescript(
        {
          uuid: '1',
          title: '接口',
          description: '描述描述',
          name: 'MyInterface',
          type: ObjectType.Command,
          properties: [
            {
              uuid: '2',
              title: '属性1',
              description: '描述描述',
              name: 'prop1',
              type: 'Integer',
              optional: false,
            },
            {
              uuid: '3',
              title: '属性2',
              description: '描述描述',
              name: 'prop2',
              type: 'List<[Foo:foo]>',
              optional: true,
            },
          ],
          result: '[Bar:bar]',
        },
        {
          foo: {
            uuid: 'foo',
            name: 'Foo',
            type: ObjectType.Object,
            properties: [
              {
                uuid: '2',
                title: '属性1',
                description: '描述描述',
                name: 'prop1',
                type: 'string',
                optional: false,
              },
              {
                uuid: '3',
                title: '属性2',
                description: '描述描述',
                name: 'prop2',
                // 循环引用
                type: 'List<[Foo:foo]>',
                optional: true,
              },
            ],
          },
          enum: {
            uuid: 'enum',
            title: '枚举',
            description: '描述描述',
            name: 'MyEnum',
            type: ObjectType.Enum,
            properties: [
              {
                uuid: '2',
                title: '枚举1',
                description: '描述描述',
                name: 'Member1',
                // @ts-expect-error
                code: 1,
              },
              {
                uuid: '3',
                name: 'Member2',
                // @ts-expect-error
                code: 2,
              },
            ],
          },
          bar: {
            uuid: 'bar',
            name: 'Bar',
            type: ObjectType.Object,
            properties: [
              {
                uuid: '2',
                title: '属性1',
                description: '描述描述',
                name: 'prop1',
                type: 'string',
                optional: false,
              },
              {
                uuid: '3',
                title: '属性2',
                description: '描述描述',
                name: 'prop2',
                type: '[MyEnum:enum]',
                optional: true,
              },
            ],
          },
        }
      )
    ).toBe(`
interface Foo {
  /**
   * 属性1
   * 描述描述
   */
  prop1: string;
  /**
   * 属性2
   * 描述描述
   */
  prop2?: Array<Foo>;
}

/**
 * 枚举
 * 描述描述
 */
enum MyEnum {
  /**
   * 枚举1
   * 描述描述
   */
  Member1 = 1,
  Member2 = 2,
}


interface Bar {
  /**
   * 属性1
   * 描述描述
   */
  prop1: string;
  /**
   * 属性2
   * 描述描述
   */
  prop2?: MyEnum;
}

/**
 * 接口
 * 描述描述
 */
interface MyInterface {
  /**
   * 属性1
   * 描述描述
   */
  prop1: number;
  /**
   * 属性2
   * 描述描述
   */
  prop2?: Array<Foo>;
}`);
  });
});
