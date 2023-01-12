import { catchPromise } from '@/lib/utils';
import { FormRuleReportType, FormRules } from './types';
import {
  findRule,
  isRequired,
  normalizeRules,
  rulesToAsyncValidatorSchema,
  rulesToValidator,
  ruleToValidator,
  spreadPathPattern,
} from './utils';

test('spreadPathPattern', () => {
  expect(spreadPathPattern('a.b.c', {})).toEqual([]);
  expect(spreadPathPattern('a.b.c', { a: {} })).toEqual([]);
  expect(spreadPathPattern('a.b.c', { a: [] })).toEqual([]);
  expect(spreadPathPattern('a.b.c', { a: { b: {} } })).toEqual(['a.b.c']);
  expect(spreadPathPattern('a.b.c', { a: { b: { c: 1 } } })).toEqual(['a.b.c']);
  expect(spreadPathPattern('a.*.c', { a: { b: {}, c: {} } })).toEqual(['a.b.c', 'a.c.c']);
  expect(spreadPathPattern('a.*.c', { a: { b: { c: 1 }, c: { c: 1 } } })).toEqual(['a.b.c', 'a.c.c']);
  expect(spreadPathPattern('a.*.*', { a: { b: { c: 1, d: 2 }, c: { c: 1, e: 3 } } })).toEqual([
    'a.b.c',
    'a.b.d',
    'a.c.c',
    'a.c.e',
  ]);
  expect(spreadPathPattern('a.*.c', { a: [] })).toEqual([]);
  expect(spreadPathPattern('a.*.c', { a: [{}, {}] })).toEqual(['a.0.c', 'a.1.c']);
  expect(
    spreadPathPattern('a.*.*', {
      a: [
        { a: 1, b: 2 },
        { c: 3, d: 4 },
      ],
    })
  ).toEqual(['a.0.a', 'a.0.b', 'a.1.c', 'a.1.d']);
});

test('findRule', () => {
  const rules: FormRules = {
    fields: {
      a: {
        $self: { type: 'any' },
        '*': {
          $self: { type: 'string', required: true },
        },
        fields: {
          b: {
            $self: [
              {
                required: true,
              },
            ],
          },
        },
      },
    },
  };

  expect(findRule(rules, 'b')).toBe(null);
  expect(findRule(rules, 'b.c')).toBe(null);
  expect(findRule(rules, 'a')).toEqual({
    $self: { type: 'any' },
    '*': {
      $self: { type: 'string', required: true },
    },
    fields: {
      b: {
        $self: [
          {
            required: true,
          },
        ],
      },
    },
  });
  expect(findRule(rules, 'a.b')).toEqual({
    $self: [
      {
        required: true,
      },
    ],
  });
  expect(findRule(rules, 'a.c')).toEqual({
    $self: { type: 'string', required: true },
  });
  expect(findRule(rules, 'a.c.d')).toEqual(null);

  expect(isRequired(rules, 'a')).toBe(false);
  expect(isRequired(rules, 'a.b')).toBe(true);
  expect(isRequired(rules, 'a.c')).toBe(true);
});

test('ruleToValidator', () => {
  expect(ruleToValidator('p', { required: true })(undefined)).resolves.toEqual({
    errors: ['p is required'],
    warnings: [],
    path: 'p',
    value: undefined,
  });
  expect(ruleToValidator('p', { required: true })(1)).resolves.toEqual(null);
  expect(ruleToValidator('p', { type: 'string' })(1)).resolves.toEqual({
    errors: ['p is not a string'],
    path: 'p',
    value: 1,
    warnings: [],
  });
});

test('rulesToAsyncValidateSchema', async () => {
  expect(() => {
    rulesToAsyncValidatorSchema({
      $self: {},
    });
  }).not.toThrow();

  expect(() => {
    rulesToAsyncValidatorSchema({});
  }).not.toThrowError();

  const schema = rulesToAsyncValidatorSchema({
    fields: {
      a: {
        $self: { required: true },
      },
      b: {
        $self: { type: 'array' },
        '*': {
          $self: {
            type: 'string',
          },
        },
      },
      // 嵌套
      c: {
        $self: { type: 'object' },
        fields: {
          c1: { $self: { type: 'string' } },
          c2: { $self: { type: 'number' } },
        },
      },
      // 复杂嵌套
      d: {
        $self: { type: 'object' },
        fields: {
          d1: {
            $self: { type: 'array' },
            '*': {
              $self: { type: 'string' },
            },
            fields: {
              0: { $self: { type: 'number' } },
            },
          },
        },
      },
      e: {
        $self: { type: 'array', required: true },
        '*': { $self: { type: 'string' } },
      },
    },
  });

  expect(schema.rules).toEqual({
    a: [
      {
        required: true,
      },
    ],
    b: [
      {
        type: 'array',
      },
      {
        defaultField: [
          {
            type: 'string',
          },
        ],
        type: 'array',
      },
    ],
    c: [
      {
        type: 'object',
      },
      {
        fields: {
          c1: [
            {
              type: 'string',
            },
          ],
          c2: [
            {
              type: 'number',
            },
          ],
        },
        type: 'object',
      },
    ],
    d: [
      {
        type: 'object',
      },
      {
        fields: {
          d1: [
            {
              type: 'array',
            },
            {
              fields: {
                '0': [
                  {
                    type: 'number',
                  },
                ],
              },
              type: 'array',
            },
            {
              defaultField: [
                {
                  type: 'string',
                },
              ],
              type: 'array',
            },
          ],
        },
        type: 'object',
      },
    ],
    e: [
      {
        required: true,
        type: 'array',
      },
      {
        defaultField: [
          {
            type: 'string',
          },
        ],
        type: 'array',
      },
    ],
  });

  const errors = await new Promise((resolve, reject) => {
    schema
      .validate({ b: [1], c: { c1: 1, c2: 2 }, d: { d1: ['string', 'string', 1] } }, { suppressWarning: true })
      .catch(err => {
        resolve(err.errors.map((i: any) => i.message));
      });
  });

  expect(errors).toEqual([
    'a is required',
    'b.0 is not a string',
    'c.c1 is not a string',
    'd.d1.0 is not a number',
    'd.d1.2 is not a string',
    'e is required',
  ]);
});

test('rulesToValidator', async () => {
  const validate = rulesToValidator({
    fields: {
      a: {
        $self: {
          required: true,
          reportType: FormRuleReportType.Warning,
        },
      },
      b: {
        $self: {
          required: true,
        },
      },
      c: {
        $self: { type: 'object' },
        '*': { $self: { type: 'string' } },
      },
    },
  });

  const results = await validate({ c: [1] }, { firstFields: false });

  expect(Array.from(results!.values())).toEqual([
    {
      errors: ['b is required'],
      path: 'b',
      value: undefined,
      warnings: [],
    },
    {
      errors: ['c is not an object'],
      path: 'c',
      value: [1],
      warnings: [],
    },
    {
      errors: ['c.0 is not a string'],
      path: 'c.0',
      value: 1,
      warnings: [],
    },
    {
      errors: [],
      path: 'a',
      value: undefined,
      warnings: ['a is required'],
    },
  ]);
});

test('normalizeRules', async () => {
  const context: any = {
    a: 1,
    b: 2,
  };

  const aValidator = jest.fn(() => Promise.reject(new Error('some error')));
  const rules = normalizeRules(
    {
      fields: {
        a: {
          $self: [{ required: true }, { validator: aValidator }],
        },
        b: {
          $self: [{ required: true }],
        },
      },
    },
    () => context
  );

  const schema = rulesToAsyncValidatorSchema(rules);
  const result1 = await catchPromise(
    schema.validate({}, { firstFields: true, suppressWarning: true, suppressValidatorError: true })
  );
  expect((result1 as any).errors).toEqual([
    { message: 'a is required', field: 'a' },
    { message: 'b is required', field: 'b' },
  ]);

  const result2 = await catchPromise(schema.validate({}, { suppressWarning: true, suppressValidatorError: true }));
  expect((result2 as any).errors).toEqual([
    { message: 'b is required', field: 'b' },
    { message: 'a is required', field: 'a' },
    { message: 'some error', field: 'a' },
  ]);
});
