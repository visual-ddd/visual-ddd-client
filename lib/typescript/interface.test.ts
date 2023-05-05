// BEGIN: 9f8d7c6a3b2e
import { generateInterface } from './interface';

describe('generateInterface', () => {
  it('should generate interface code', () => {
    const description = {
      name: 'User',
      properties: [
        {
          name: 'id',
          type: 'string',
          comment: {
            title: '用户 ID',
            description: '用户的唯一标识',
          },
        },
        {
          name: 'name',
          type: 'string',
          comment: {
            title: '用户名',
            description: '用户的名称',
          },
        },
        {
          name: 'age',
          type: 'number',
          optional: true,
          comment: {
            title: '用户年龄',
            description: '用户的年龄',
          },
        },
        {
          name: 'propertyWithoutComment',
          type: 'string',
        },
      ],
    };

    const expected = `interface User {
  /**
   * 用户 ID
   * 用户的唯一标识
   */
  id: string;
  /**
   * 用户名
   * 用户的名称
   */
  name: string;
  /**
   * 用户年龄
   * 用户的年龄
   */
  age?: number;
  propertyWithoutComment: string;
}`;

    expect(generateInterface(description)).toEqual(expected);
  });

  it('should throw error when name is empty', () => {
    const description = {
      name: '',
      properties: [],
    };

    expect(() => generateInterface(description)).toThrowError('接口名称不能为空');
  });

  it('should throw error when property name is empty', () => {
    const description = {
      name: 'User',
      properties: [
        {
          name: '',
          type: 'string',
        },
      ],
    };

    expect(() => generateInterface(description)).toThrowError('属性名称不能为空');
  });

  it('should throw error when property type is empty', () => {
    const description = {
      name: 'User',
      properties: [
        {
          name: 'id',
          type: '',
        },
      ],
    };

    expect(() => generateInterface(description)).toThrowError('属性类型不能为空');
  });
});
// END: 9f8d7c6a3b2e
