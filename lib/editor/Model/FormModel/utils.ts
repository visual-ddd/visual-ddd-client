import Schema, { ValidateError, ValidateOption, Rules, RuleItem } from 'async-validator';
import toPath from 'lodash/toPath';
import memoize from 'lodash/memoize';
import { booleanPredicate, cloneDeep } from '@wakeapp/utils';
import { catchPromise } from '@/lib/utils';

import { FormRules, FormRule, FormRuleError, FormRuleItem, FormItemValidateStatus, FormRuleReportType } from './types';

type RawAsyncValidateError = {
  errors: ValidateError[];
  fields: Record<string, ValidateError[]>;
};

export const toPathArray = memoize(path => {
  return toPath(path);
});

export const normalizePath = memoize((path: string) => {
  return toPathArray(path).join('.');
});

/**
 * 查找验证规则
 * @param rules
 * @param path
 * @returns
 */
export const findRule = (rules: FormRules, path: string): FormRule | null => {
  const nPath = toPathArray(path);
  let current: FormRules | undefined = rules;

  if (current == null) {
    return null;
  }

  for (const section of nPath) {
    if (current == null) {
      return null;
    }

    if (current.fields && section in current.fields) {
      current = current.fields[section];
    } else if (current['*']) {
      current = current['*'];
    } else {
      // 未找到匹配字段
      return null;
    }
  }

  return current?.$self ?? null;
};

const normalizeRules = (rule: FormRule): FormRuleItem[] => {
  if (Array.isArray(rule)) {
    return rule;
  }

  return [rule];
};

const VALIDATE_OPTIONS: ValidateOption = {
  suppressValidatorError: true,
  suppressWarning: true,
};

/**
 * 单规则验证
 */
export const ruleToValidator = (path: string, rule: FormRule) => {
  const rules = normalizeRules(rule);
  const schemas = rules.map(i => {
    const schema = new Schema({
      [path]: i,
    });

    return {
      rule: i,
      schema,
    };
  });

  return async (value: any): Promise<FormItemValidateStatus | null> => {
    const datasource = { [path]: value };

    const errors = (
      await Promise.all(
        schemas.map(async ({ schema, rule }): Promise<FormRuleError | null> => {
          try {
            await schema.validate(datasource, VALIDATE_OPTIONS);

            return null;
          } catch (error) {
            const err = error as RawAsyncValidateError;

            if (err?.errors?.length) {
              return {
                rule,
                message: err.errors.map(i => i.message).filter(booleanPredicate),
              };
            }

            return null;
          }
        })
      )
    ).filter(booleanPredicate);

    return formRuleErrorsToFormItemValidateStatus(path, value, errors);
  };
};

export const NoopValidator = () => Promise.resolve(null);

/**
 * 转换 Rules 为 AsyncValidate Schema
 * @param rules
 */
export const rulesToAsyncValidateSchema = (rules: FormRules): Schema => {
  const walk = (rules: FormRules, desc: RuleItem[]) => {
    if (rules.$self) {
      const nSelfRules = normalizeRules(rules.$self);
      desc.push(...nSelfRules);
    }

    if (rules.fields || rules['*']) {
      const selfRule = rules.$self;

      if (selfRule == null) {
        console.log(rules);
        throw new Error(`当字段指定了 fields 或 * 时, $self 必须定义`);
      }

      const nSelfRules = normalizeRules(selfRule);
      const types = nSelfRules.filter(r => !!r.type);
      if (!types.length) {
        console.log(rules);
        throw new Error(`当字段指定了 fields 或 * 时, $self 必须定义 type 为 array 或 object`);
      }

      const typesInSet = new Set(types.map(i => i.type));
      if (typesInSet.size > 1 || (!typesInSet.has('array') && !typesInSet.has('object'))) {
        console.log(rules);
        throw new Error(`当字段指定了 fields 或 * 时, $self 必须定义 type 为 array 或 object`);
      }

      const finalType = typesInSet.has('array') ? 'array' : 'object';

      if (rules.fields) {
        desc.push({
          type: finalType,
          fields: Object.keys(rules.fields).reduce((acc, key) => {
            const items: RuleItem[] = [];
            walk(rules.fields![key], items);

            acc[key] = items;

            return acc;
          }, {} as Record<string, RuleItem[]>),
        });
      }

      if (rules['*']) {
        const items: RuleItem[] = [];
        walk(rules['*'], items);
        desc.push({
          type: finalType,
          defaultField: items,
        });
      }
    }
  };

  if (rules.$self != null || rules['*'] != null || rules.fields == null) {
    throw new Error(`根对象的 $self、* 定义将被忽略`);
  }

  const descriptor: Rules = {};
  const fields = Object.keys(rules.fields);

  for (const field of fields) {
    const items: RuleItem[] = [];
    walk(rules.fields[field], items);
    descriptor[field] = items;
  }

  return new Schema(descriptor);
};

export const rulesToValidator = memoize((rules: FormRules) => {
  // 按照 warning 和 errors 拆分为两个 rules，方便后面独立验证
  const errorRules = cloneDeep(rules);
  const warningRules = cloneDeep(rules);

  const walkAndFilterRules = (rules: FormRules, filter: (rule: FormRuleItem) => boolean) => {
    if (rules.$self) {
      const list = normalizeRules(rules.$self).filter(filter);
      rules.$self = list;
    }

    if (rules['*']) {
      const result = walkAndFilterRules(rules['*'], filter);

      if (!result?.length) {
        delete rules['*'];
      }
    }

    if (rules.fields) {
      const keys = Object.keys(rules.fields);
      for (const key of keys) {
        const result = walkAndFilterRules(rules.fields[key], filter);
        if (!result?.length) {
          delete rules.fields[key];
        }
      }

      if (!Object.keys(rules.fields)) {
        delete rules.fields;
      }
    }

    return rules.$self;
  };

  walkAndFilterRules(errorRules, i => i.reportType !== FormRuleReportType.Warning);
  walkAndFilterRules(warningRules, i => i.reportType === FormRuleReportType.Warning);

  const errorSchema = rulesToAsyncValidateSchema(errorRules);
  const warningSchema = rulesToAsyncValidateSchema(warningRules);

  return async (value: any): Promise<Map<string, FormItemValidateStatus> | null> => {
    const [error, warnings] = await Promise.all([
      catchPromise<RawAsyncValidateError>(errorSchema.validate(value, VALIDATE_OPTIONS)),
      catchPromise<RawAsyncValidateError>(warningSchema.validate(value, VALIDATE_OPTIONS)),
    ]);

    if (error || warnings) {
      const map: Map<string, FormItemValidateStatus> = new Map<string, FormItemValidateStatus>();
      const getStatus = (path: string, value: any) => {
        if (map.has(path)) {
          return map.get(path)!;
        }

        const status: FormItemValidateStatus = {
          path,
          value,
          errors: [],
          warnings: [],
        };

        map.set(path, status);

        return status;
      };

      const walkFields = (fields: RawAsyncValidateError['fields'], type: 'error' | 'warning') => {
        for (const path in fields) {
          for (const field of fields[path]) {
            const status = getStatus(path, field.fieldValue);
            const list = type === 'error' ? status.errors : status.warnings;
            if (!list.includes(field.message!)) {
              list.push(field.message!);
            }
          }
        }
      };

      if (error) {
        walkFields(error.fields, 'error');
      }

      if (warnings) {
        walkFields(warnings.fields, 'warning');
      }

      return map;
    }

    return null;
  };
});

/**
 * 转化验证错误对象数组为状态对象
 * @param path
 * @param value
 * @param errors
 * @returns
 */
export const formRuleErrorsToFormItemValidateStatus = (
  path: string,
  value: string,
  errors: FormRuleError[]
): FormItemValidateStatus | null => {
  if (!errors.length) {
    return null;
  }

  const status: FormItemValidateStatus = {
    path,
    value,
    errors: [],
    warnings: [],
  };

  for (const error of errors) {
    const list = error.rule.reportType === FormRuleReportType.Warning ? status.warnings : status.errors;
    for (const item of error.message) {
      if (!list.includes(item)) {
        list.push(item);
      }
    }
  }

  return status;
};
