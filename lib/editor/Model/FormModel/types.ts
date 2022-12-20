import { RuleItem } from 'async-validator';

export enum FormRuleReportType {
  Error,
  Warning,
}

export interface FormRuleItem extends RuleItem {
  /**
   * 报告类型，默认为 error
   */
  reportType?: FormRuleReportType;

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
