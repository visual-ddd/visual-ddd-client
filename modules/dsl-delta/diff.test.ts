import { atomDiff, objectDiff, objectArrayDiff, objectEqual } from './diff';
import { Delta, ValueType } from './protocol';

test('atomDiff', () => {
  expect(atomDiff('k', null, null)).toEqual(undefined);
  expect(atomDiff('k', 1, 1)).toEqual(undefined);
  expect(atomDiff('k', 1, null)).toEqual({ key: 'k', type: Delta.OP.OP_NEW });
  expect(atomDiff('k', null, 1)).toEqual({ key: 'k', type: Delta.OP.OP_DELETE, value: 1 });
  expect(atomDiff('k', {}, {})).toEqual(undefined);
  expect(atomDiff('k', [1], [1])).toEqual(undefined);
});

test('objectEqual', () => {
  expect(objectEqual(null, null)).toEqual(false);
  expect(objectEqual({}, {})).toEqual(true);
  expect(objectEqual({ uuid: 1 }, { uuid: 1 })).toEqual(true);
  expect(objectEqual({ uuid: 1 }, { uuid: 2 })).toEqual(false);
});

test('objectArrayDiff', () => {
  expect(objectArrayDiff([], [], {})).toEqual({
    delta: {
      op: Delta.OP.OP_NONE,
      deltas: [],
    },
    result: [],
  });

  // 健壮处理
  expect(objectArrayDiff([1], 1, {})).toEqual({
    delta: {
      op: Delta.OP.OP_NONE,
      deltas: [],
    },
    result: [1],
  });
  expect(objectArrayDiff(1, [1], {})).toEqual({
    delta: {
      op: Delta.OP.OP_NONE,
      deltas: [],
    },
    result: [1],
  });

  // 完全新增
  expect(objectArrayDiff([{ uuid: 1 }, { uuid: 2 }], [], {})).toEqual({
    delta: {
      op: Delta.OP.OP_UPDATE,
      deltas: [],
    },
    result: [
      {
        __delta: {
          deltas: [],
          op: Delta.OP.OP_NEW,
        },
        uuid: 1,
      },
      {
        __delta: {
          deltas: [],
          op: Delta.OP.OP_NEW,
        },
        uuid: 2,
      },
    ],
  });

  // 完全删除
  expect(objectArrayDiff([], [{ uuid: 1 }, { uuid: 2 }], {})).toEqual({
    delta: {
      op: Delta.OP.OP_UPDATE,
      deltas: [],
    },
    result: [
      {
        __delta: {
          deltas: [],
          op: Delta.OP.OP_DELETE,
        },
        uuid: 1,
      },
      {
        __delta: {
          deltas: [],
          op: Delta.OP.OP_DELETE,
        },
        uuid: 2,
      },
    ],
  });

  // 保持不变
  expect(objectArrayDiff([{ uuid: 1 }, { uuid: 2 }], [{ uuid: 1 }, { uuid: 2 }], {})).toEqual({
    delta: {
      op: Delta.OP.OP_NONE,
      deltas: [],
    },
    result: [
      {
        uuid: 1,
      },
      {
        uuid: 2,
      },
    ],
  });

  // 移动
  expect(objectArrayDiff([{ uuid: 2 }, { uuid: 1 }], [{ uuid: 1 }, { uuid: 2 }], {})).toEqual({
    delta: {
      op: Delta.OP.OP_UPDATE,
      deltas: [],
    },
    result: [
      {
        uuid: 2,
      },
      {
        uuid: 1,
      },
    ],
  });

  // 混合
  expect(objectArrayDiff([{ uuid: 1 }, { uuid: 4 }, { uuid: 2 }], [{ uuid: 1 }, { uuid: 2 }, { uuid: 5 }], {})).toEqual(
    {
      delta: {
        op: Delta.OP.OP_UPDATE,
        deltas: [],
      },
      result: [
        {
          uuid: 1,
        },
        {
          uuid: 4,
          __delta: {
            op: Delta.OP.OP_NEW,
            deltas: [],
          },
        },
        {
          uuid: 2,
        },
        {
          uuid: 5,
          __delta: {
            op: Delta.OP.OP_DELETE,
            deltas: [],
          },
        },
      ],
    }
  );
});

describe('objectDiff', () => {
  test('exception', () => {
    // @ts-expect-error
    expect(() => objectDiff({}, {}, undefined)).toThrow();
  });

  test('atom compare', () => {
    expect(objectDiff({}, {}, {})).toEqual({
      op: Delta.OP.OP_NONE,
      deltas: [],
    });

    expect(objectDiff({}, {}, { a: ValueType.Atom })).toEqual({
      op: Delta.OP.OP_NONE,
      deltas: [],
    });

    expect(
      objectDiff(
        {
          a: 1,
          b: 3,
          c: {},
          d: [1],
        },
        {
          a: 2,
          b: 4,
          c: {},
          e: [1, 2, {}],
        },
        { a: ValueType.Atom, b: ValueType.Never, c: ValueType.Atom, d: ValueType.Atom, e: ValueType.Atom }
      )
    ).toEqual({
      op: Delta.OP.OP_UPDATE,
      deltas: [
        {
          key: 'a',
          oldValue: 2,
          type: Delta.OP.OP_UPDATE,
        },
        {
          key: 'd',
          type: Delta.OP.OP_NEW,
        },
        {
          key: 'e',
          type: 2,
          value: [1, 2, {}],
        },
      ],
    });
  });

  test('object compare', () => {
    const source = {
      a: {
        foo: 1,
      },
      b: 1,
      c: {
        bar: 1,
      },
      newComer: {},
      idNonChanged: { uuid: 1 },
      idChanged: { uuid: 1 },
    };

    expect(
      objectDiff(
        source,
        {
          a: {
            foo: 2,
          },
          c: {
            bar: 1,
          },
          removeMe: { a: 1 },
          idNonChanged: { uuid: 1 },
          idChanged: { uuid: 2 },
        },
        {
          // 嵌套对象
          a: {
            foo: ValueType.Atom,
          },
          b: ValueType.Atom,
          c: {
            bar: ValueType.Atom,
          },
          newComer: {},
          removeMe: {},
          idNonChanged: {},
          idChanged: {},
        }
      )
    ).toEqual({
      op: Delta.OP.OP_UPDATE,
      deltas: [
        {
          type: Delta.OP.OP_UPDATE,
          key: 'a',
        },
        {
          key: 'b',
          type: Delta.OP.OP_NEW,
        },
        {
          key: 'newComer',
          type: Delta.OP.OP_NEW,
        },
        {
          key: 'removeMe',
          type: Delta.OP.OP_DELETE,
          value: {
            __delta: {
              deltas: [],
              op: Delta.OP.OP_DELETE,
            },
            a: 1,
          },
        },
        // 先删后增
        {
          key: 'idChanged',
          type: 2,
          value: {
            __delta: {
              deltas: [],
              op: Delta.OP.OP_DELETE,
            },
            uuid: 2,
          },
        },
        {
          key: 'idChanged',
          type: Delta.OP.OP_NEW,
        },
      ],
    });

    expect(source).toEqual({
      a: {
        __delta: {
          op: Delta.OP.OP_UPDATE,
          deltas: [
            {
              type: Delta.OP.OP_UPDATE,
              key: 'foo',
              oldValue: 2,
            },
          ],
        },
        foo: 1,
      },
      b: 1,
      c: {
        bar: 1,
      },
      newComer: {
        __delta: {
          deltas: [],
          op: 1,
        },
      },
      idChanged: {
        __delta: {
          deltas: [],
          op: Delta.OP.OP_NEW,
        },
        uuid: 1,
      },
      idNonChanged: {
        uuid: 1,
      },
    });
  });

  test('object compare deep', () => {
    const source = {
      a: {
        b: {
          c: {
            foo: 1,
          },
        },
      },
    };

    expect(
      objectDiff(
        source,
        {
          a: {
            b: {
              c: {
                foo: 2,
              },
            },
          },
        },
        {
          a: {
            b: {
              c: {
                foo: ValueType.Atom,
              },
            },
          },
        }
      )
    ).toEqual({
      deltas: [
        {
          key: 'a',
          type: Delta.OP.OP_UPDATE,
        },
      ],
      op: Delta.OP.OP_UPDATE,
    });

    expect(source).toEqual({
      a: {
        __delta: {
          deltas: [
            {
              key: 'b',
              type: Delta.OP.OP_UPDATE,
            },
          ],
          op: Delta.OP.OP_UPDATE,
        },
        b: {
          __delta: {
            deltas: [
              {
                key: 'c',
                type: Delta.OP.OP_UPDATE,
              },
            ],
            op: Delta.OP.OP_UPDATE,
          },
          c: {
            __delta: {
              deltas: [
                {
                  key: 'foo',
                  oldValue: 2,
                  type: Delta.OP.OP_UPDATE,
                },
              ],
              op: Delta.OP.OP_UPDATE,
            },
            foo: 1,
          },
        },
      },
    });
  });

  test('object array compare', () => {
    // invalid array meta
    // @ts-expect-error
    expect(() => objectDiff({ a: [] }, {}, { a: [] })).toThrow();
    expect(() => objectDiff({ a: [] }, {}, { a: [1] })).toThrow();

    // not change
    expect(objectDiff({ a: [] }, { a: [] }, { a: [{}] })).toEqual({
      deltas: [],
      op: Delta.OP.OP_NONE,
    });

    const source1 = { a: [{ uuid: 1 }] };
    expect(objectDiff(source1, { a: [{ uuid: 2 }] }, { a: [{}] })).toEqual({
      deltas: [
        {
          key: 'a',
          type: Delta.OP.OP_UPDATE,
        },
      ],

      op: Delta.OP.OP_UPDATE,
    });

    expect(source1).toEqual({
      a: [
        {
          __delta: {
            deltas: [],
            op: Delta.OP.OP_NEW,
          },
          uuid: 1,
        },
        {
          __delta: {
            deltas: [],
            op: Delta.OP.OP_DELETE,
          },
          uuid: 2,
        },
      ],
    });
  });
});
