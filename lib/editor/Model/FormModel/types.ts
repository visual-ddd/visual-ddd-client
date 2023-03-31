import { InternalRuleItem, RuleItem } from 'async-validator';
import { BaseEditorModel } from '../BaseEditorModel';
import { FormModel } from './FormModel';

export enum FormRuleReportType {
  Error = 'error',
  Warning = 'warning',
}

export type FormValidatorContext = {
  rawRule: InternalRuleItem;
  rule: FormRuleItem;
  model: FormModel;
  editorModel: BaseEditorModel;
  scope: IBaseEditorScopeMembers;
};

export type FormValidator = (value: any, context: FormValidatorContext) => Promise<void>;

export interface FormRuleItem extends Omit<RuleItem, 'validator' | 'asyncValidator'> {
  /**
   * 报告类型，默认为 error
   */
  reportType?: FormRuleReportType;

  /**
   * 自定义验证器
   */
  validator?: FormValidator;

  /**
   * 无法作用的验证规则
   * TODO: 使用这个提升验证性能
   */
  pure?: boolean;
}

/**
 * 验证规则
 */
export type FormRule = FormRuleItem | FormRuleItem[];

/**
 * 规则树
 */
export type FormRules = {
  /**
   * 当前字段本身规则
   */
  $self?: FormRule;

  /**
   * 下级通配字段，可以匹配对象或者数组
   */
  '*'?: FormRules;

  /**
   * 指定对象字段验证规则,
   */
  fields?: {
    [key: string]: FormRules;
  };
};

export interface FormItemValidateStatus {
  /**
   * 路径
   */
  path: string;

  /**
   * 验证的值
   */
  value: any;

  /**
   * 错误信息
   */
  errors: string[];

  /**
   * 警告信息
   */
  warnings: string[];
}

/**
 * 规则错误信息
 */
export interface FormRuleError {
  rule: FormRuleItem;
  message: string[];
}

export interface IValidator<T = any> {
  /**
   * 当前表单的所有值
   */
  readonly values: T;

  /**
   * 字段验证
   * @param fieldPath
   * @returns
   */
  validateField: (fieldPath: string) => any;

  /**
   * 验证所有
   * @returns
   */
  validateAll: () => any;
}

/**
 * 验证器配置
 */
export interface ValidatorConfiguration {
  /**
   * 自定义冲突检查规则
   * 默认验证 name
   */
  checkConflict?: string | string[] | ((validator: IValidator) => void);
}
