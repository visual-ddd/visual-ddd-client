// BEGIN: abpxx6d04wxr-test
import { generateEnum, EnumDescription } from './enum';

describe('generateEnum', () => {
  it('should generate enum code', () => {
    const description: EnumDescription = {
      name: 'TestEnum',
      comment: {
        title: 'title',
      },
      member: [
        {
          name: 'Member1',
          code: 1,
          comment: {
            title: 'Member1',
            description: 'This is member 1',
          },
        },
        {
          name: 'Member2',
          code: 2,
          comment: {
            title: 'Member2',
            description: 'This is member 2',
          },
        },
        {
          name: 'MemberWithComment',
          code: 3,
        },
        {
          name: 'MemberWithoutCode',
        },
      ],
    };

    const expected = `/**
 * title
 */
enum TestEnum {
  /**
   * Member1
   * This is member 1
   */
  Member1 = 1,
  /**
   * Member2
   * This is member 2
   */
  Member2 = 2,
  MemberWithComment = 3,
  MemberWithoutCode,
}`;

    const actual = generateEnum(description);

    console.log(actual);

    expect(actual).toEqual(expected);
  });

  it('should throw error if name is not provided', () => {
    // @ts-expect-error
    const description: EnumDescription = {
      member: [],
    };

    expect(() => generateEnum(description)).toThrow('枚举名称不能为空');
  });

  it('should throw error if member name is not provided', () => {
    const description: EnumDescription = {
      name: 'TestEnum',
      member: [
        // @ts-expect-error
        {
          code: 1,
        },
      ],
    };

    expect(() => generateEnum(description)).toThrow('枚举成员名称不能为空');
  });
});
// END: abpxx6d04wxr-test
