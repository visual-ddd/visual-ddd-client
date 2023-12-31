import Schema, { ValidateError, ValidateOption, Rules, RuleItem } from 'async-validator';
import toPath from 'lodash/toPath';
import memoize from 'lodash/memoize';
import { booleanPredicate, cloneDeep, NoopArray, pick } from '@wakeapp/utils';
import { catchPromise } from '@/lib/utils';

import {
  FormRules,
  FormRule,
  FormRuleError,
  FormRuleItem,
  FormItemValidateStatus,
  FormRuleReportType,
  FormValidator,
  FormValidatorContext,
} from './types';

type RawAsyncValidateError = {
  errors: ValidateError[];
  fields: Record<string, ValidateError[]>;
};

const VALIDATE_OPTIONS: ValidateOption = {
  suppressValidatorError: true,
  suppressWarning: true,
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
export const findRule = (rules: FormRules, path: string): FormRules | null => {
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

  return current ?? null;
};

/**
 * 判断是否包含必填规则
 * @param rules
 * @param path
 * @returns
 */
export const isRequired = (rules: FormRules, path: string): boolean => {
  const rule = findRule(rules, path);
  if (rule == null) {
    return false;
  }

  const self = rule.$self;

  if (self == null) {
    return false;
  }

  return !!(Array.isArray(self) ? self.some(i => i.required) : self.required);
};

const normalizeRule = (rule: FormRule): FormRuleItem[] => {
  if (Array.isArray(rule)) {
    return rule;
  }

  return [rule];
};

/**
 * 规范化验证规则，支持获取上下文
 * @param rules
 */
export const normalizeRules = (rules: FormRules, getContext: () => Omit<FormValidatorContext, 'rule' | 'rawRule'>) => {
  const wrapContextAndCompatible = (fn: FormValidator | undefined, rule: FormRuleItem): FormValidator | undefined => {
    if (fn == null) {
      return fn;
    }

    // 兼容 async-validator
    const validator: RuleItem['validator'] = (rawRule, value, callback, source, options) => {
      fn(value, { rule, rawRule, ...getContext() }).then(
        () => {
          callback();
        },
        reason => {
          callback(typeof reason === 'object' ? reason.message : reason);
        }
      );
    };

    return validator as any as FormValidator | undefined;
  };

  const walk = (rules: FormRules) => {
    if (rules.$self) {
      rules.$self = normalizeRule(rules.$self);
      for (const r of rules.$self) {
        r.validator = wrapContextAndCompatible(r.validator, r);
      }
    }

    if (rules.fields) {
      for (const key in rules.fields) {
        walk(rules.fields[key]);
      }
    }

    if (rules['*']) {
      walk(rules['*']);
    }
  };

  walk(rules);

  return rules;
};

/**
 * 单规则验证
 */
export const ruleToValidator = (path: string, rule: FormRule) => {
  const rules = normalizeRule(rule);
  const schemas = rules.map(i => {
    const schema = new Schema({
      [path]: i as RuleItem,
    });

    return {
      rule: i,
      schema,
    };
  });

  return async (value: any, options?: ValidateOption): Promise<FormItemValidateStatus | null> => {
    const datasource = { [path]: value };
    const validateOptions = { ...VALIDATE_OPTIONS, ...options };

    const errors = (
      await Promise.all(
        schemas.map(async ({ schema, rule }): Promise<FormRuleError | null> => {
          try {
            await schema.validate(datasource, validateOptions);

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
const NoopSchema = new Schema({});

/**
 * 转换 Rules 为 AsyncValidate Schema
 * @param rules
 */
export const rulesToAsyncValidatorSchema = (rules: FormRules): Schema => {
  if (rules.fields == null) {
    return NoopSchema;
  }

  if (rules.$self != null || rules['*'] != null) {
    console.warn(`根对象的 $self、* 定义将被忽略`);
  }

  const walk = (rules: FormRules, desc: RuleItem[]) => {
    if (rules.$self) {
      const nSelfRules = normalizeRule(rules.$self) as RuleItem[]; // FormRuleItem 会规范化和 RuleItem 兼容
      desc.push(...nSelfRules);
    }

    if (rules.fields || rules['*']) {
      const selfRule = rules.$self;

      if (selfRule == null) {
        console.log(rules);
        throw new Error(`当字段指定了 fields 或 * 时, $self 必须定义, 且 type 为 array 或 object`);
      }

      const nSelfRules = normalizeRule(selfRule);
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

  const descriptor: Rules = {};
  const fields = Object.keys(rules.fields);

  for (const field of fields) {
    const items: RuleItem[] = [];
    walk(rules.fields[field], items);
    descriptor[field] = items;
  }

  return new Schema(descriptor);
};

/**
 * 将规则转换为验证器
 * @param rules
 * @returns
 */
export const rulesToValidator = (rules: FormRules) => {
  // 按照 warning 和 errors、tips 拆分为各自的 rules，方便后面独立验证
  const errorRules = cloneDeep(rules);
  const warningRules = cloneDeep(rules);
  const tipRules = cloneDeep(rules);

  const walkAndFilterRules = (rules: FormRules, filter: (rule: FormRuleItem) => boolean) => {
    if (rules['*']) {
      walkAndFilterRules(rules['*'], filter);

      // 没有包含任何子规则
      if (!Object.keys(rules['*']).length) {
        delete rules['*'];
      }
    }

    if (rules.fields) {
      const keys = Object.keys(rules.fields);
      for (const key of keys) {
        const val = rules.fields[key];
        walkAndFilterRules(val, filter);
        if (!Object.keys(val).length) {
          delete rules.fields[key];
        }
      }

      if (!Object.keys(rules.fields).length) {
        delete rules.fields;
      }
    }

    if (rules.$self) {
      const normalizedList = normalizeRule(rules.$self);
      const list = normalizedList.filter(filter);
      rules.$self = list;

      if (!list.length) {
        if (rules['*'] || rules.fields) {
          // 下级是数组或者对象，需要保留结构声明
          const baseTypeRule = normalizedList.find(i => i.type === 'object' || i.type === 'array');
          if (baseTypeRule) {
            rules.$self = [pick(baseTypeRule, 'type')];
          } else {
            // 直接清空, 后面 rulesToAsyncValidatorSchema 会抛出异常
            delete rules.$self;
          }
        } else {
          // 没有下级，直接清空
          delete rules.$self;
        }
      }
    }
  };

  walkAndFilterRules(errorRules, i => i.reportType === FormRuleReportType.Error || i.reportType == null);
  walkAndFilterRules(warningRules, i => i.reportType === FormRuleReportType.Warning);
  walkAndFilterRules(tipRules, i => i.reportType === FormRuleReportType.Tip);

  const errorSchema = rulesToAsyncValidatorSchema(errorRules);
  const warningSchema = rulesToAsyncValidatorSchema(warningRules);
  const tipSchema = rulesToAsyncValidatorSchema(tipRules);

  return async (value: any, options?: ValidateOption): Promise<Map<string, FormItemValidateStatus> | null> => {
    const validateOptions = { ...VALIDATE_OPTIONS, ...options };
    const [error, warnings, tips] = await Promise.all([
      catchPromise<RawAsyncValidateError>(errorSchema.validate(value, validateOptions)),
      catchPromise<RawAsyncValidateError>(warningSchema.validate(value, validateOptions)),
      catchPromise<RawAsyncValidateError>(tipSchema.validate(value, validateOptions)),
    ]);

    if (error || warnings || tips) {
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
          tips: [],
        };

        map.set(path, status);

        return status;
      };

      const walkFields = (fields: RawAsyncValidateError['fields'], type: 'error' | 'warning' | 'tip') => {
        for (const path in fields) {
          for (const field of fields[path]) {
            const status = getStatus(path, field.fieldValue);
            const list = type === 'error' ? status.errors : type === 'warning' ? status.warnings : status.tips;
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

      if (tips) {
        walkFields(tips.fields, 'tip');
      }

      return map;
    }

    return null;
  };
};

/**
 * 转化验证错误对象数组为状态对象
 * @param path
 * @param value
 * @param errors
 * @returns
 */
const formRuleErrorsToFormItemValidateStatus = (
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
    tips: [],
  };

  for (const error of errors) {
    const list =
      error.rule.reportType === FormRuleReportType.Warning
        ? status.warnings
        : error.rule.reportType === FormRuleReportType.Tip
        ? status.tips
        : status.errors;
    for (const item of error.message) {
      if (!list.includes(item)) {
        list.push(item);
      }
    }
  }

  return status;
};

/**
 * 展开路径通配符
 * @param path
 * @param object
 * @returns
 */
export function spreadPathPattern(path: string, object: any) {
  const paths = toPathArray(path);

  if (!paths.length) {
    return NoopArray;
  }

  const list: string[] = [];
  const joinRoute = (route: string, path: string) => {
    if (route) {
      return `${route}.${path}`;
    }
    return path;
  };

  const walk = (route: string, paths: string[], object: any) => {
    const path = paths[0];

    // 遍历完成
    if (!path) {
      list.push(route);
      return;
    }

    // 对象为空，没有必要继续下去, 无法获取值
    if (object == null) {
      return;
    }

    if (path === '*') {
      if (Array.isArray(object)) {
        for (let i = 0; i < object.length; i++) {
          walk(joinRoute(route, i.toString()), paths.slice(1), object[i]);
        }
      } else if (typeof object === 'object') {
        for (const key in object) {
          walk(joinRoute(route, key), paths.slice(1), object[key]);
        }
      }
    } else {
      walk(joinRoute(route, path), paths.slice(1), object[path]);
    }
  };

  walk('', paths, object);

  return list;
}
