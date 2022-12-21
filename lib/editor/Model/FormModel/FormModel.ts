import { makeObservable, observable } from 'mobx';
import memoize from 'lodash/memoize';
import { command, derive, effect, makeAutoBindThis, mutation, runInCommand } from '@/lib/store';

import { BaseNode } from '../BaseNode';
import { findRule, NoopValidator, normalizePath, rulesToValidator, ruleToValidator } from './utils';
import { FormRules, FormItemValidateStatus, FormRuleReportType } from './types';
import { BaseEditorStore } from '../BaseEditorStore';

/**
 * 表单验证模型
 * TODO: 汇总验证结果
 * TODO: 验证上下文
 * TODO: 验证性能优化
 */
export class FormModel {
  private node: BaseNode;
  private rules: FormRules;
  private store: BaseEditorStore;

  /**
   * 错误列表收集
   */
  @observable.shallow
  errorMap: Map<string, FormItemValidateStatus> = new Map();

  @derive
  get errorInArray() {
    return Array.from(this.errorMap.values());
  }

  /**
   * 当前节点错误类型
   */
  @derive
  get errorType(): FormRuleReportType | null {
    const len = this.errorMap.size;
    if (!len) {
      return null;
    }

    for (const i of this.errorMap.values()) {
      if (i.errors.length) {
        return FormRuleReportType.Error;
      }
    }

    return FormRuleReportType.Warning;
  }

  /**
   * 当前节点是否包含问题，不管是错误还是警告
   */
  @derive
  get hasIssue() {
    return !!this.errorMap.size;
  }

  /**
   * 当前节点是否包含错误
   */
  @derive
  get hasError() {
    return this.errorType === FormRuleReportType.Error;
  }

  /**
   * 当前节点是否包含警告
   */
  @derive
  get hasWarning() {
    return this.errorType === FormRuleReportType.Warning;
  }

  constructor(inject: { node: BaseNode; rules: FormRules; store: BaseEditorStore }) {
    this.node = inject.node;
    this.rules = inject.rules;
    this.store = inject.store;

    makeAutoBindThis(this);
    makeObservable(this);
  }

  /**
   * 获取属性
   */
  getProperty(path: string) {
    return this.node.getProperty(path);
  }

  /**
   * 更新属性
   * @param path
   * @param value
   */
  @command('UPDATE_PROPERTY')
  setProperty(path: string, value: any) {
    this.store.updateNodeProperty({ node: this.node, path, value });
  }

  /**
   * 删除属性
   * @param path
   */
  @command('DELETE_PROPERTY')
  deleteProperty(path: string) {
    this.store.deleteNodeProperty({ node: this.node, path });
    this.deleteValidateStatus({ path: normalizePath(path) });
  }

  /**
   * 获取错误状态
   * @param path
   * @returns
   */
  getValidateStatus(path: string): FormItemValidateStatus | undefined {
    return this.errorMap.get(normalizePath(path));
  }

  /**
   * 获取聚合的错误状态
   * @param path
   */
  getAggregatedValidateStatus(path: string) {
    const np = normalizePath(path);
    const list: FormItemValidateStatus[] = [];

    for (const key of this.errorMap.keys()) {
      if (key.startsWith(np)) {
        list.push(this.errorMap.get(key)!);
      }
    }

    return list;
  }

  /**
   * 指定字段是否为必填
   * @param path
   */
  isRequired = memoize((path: string) => {
    const rule = this.findRule(path);
    if (rule == null) {
      return false;
    }

    return !!(Array.isArray(rule) ? rule.some(i => i.required) : rule.required);
  });

  /**
   * 验证指定字段
   */
  @effect('VALIDATE_FIELD')
  async validateField(path: string) {
    const np = normalizePath(path);
    const validate = this.getFormItemValidator(np);
    const value = this.getProperty(np);
    const status = await validate(value);

    runInCommand('UPDATE_VALIDATE_STATUS', () => {
      this.setValidateStatus({ path: np, status });
    });
  }

  /**
   * 验证所有
   * TODO: 性能优化
   */
  @effect('VALIDATE_ALL')
  async validateAll(): Promise<boolean> {
    const validate = rulesToValidator(this.rules);

    const status = await validate(this.node.properties);

    runInCommand('UPDATE_VALIDATE_STATUS', () => {
      this.clearValidateStatus();
      if (status) {
        this.resetValidateStatus({ status });
      }
    });

    return !!status;
  }

  /**
   * 情况验证状态
   */
  @mutation('CLEAR_VALIDATE_STATUS')
  protected clearValidateStatus() {
    this.errorMap.clear();
  }

  /**
   * 更新验证状态
   * @param params
   */
  @mutation('UPDATE_VALIDATE_STATUS')
  protected setValidateStatus(params: { path: string; status?: FormItemValidateStatus | null }) {
    const { path, status } = params;
    if (status) {
      this.errorMap.set(path, status);
    } else {
      this.deleteValidateStatus({ path });
    }
  }

  /**
   * 删除验证状态
   * @param params
   */
  @mutation('DELETE_VALIDATE_STATUS')
  protected deleteValidateStatus(params: { path: string }) {
    const { path } = params;
    this.errorMap.delete(path);
  }

  @mutation('RESET_VALIDATE_STATUS')
  protected resetValidateStatus(params: { status: Map<string, FormItemValidateStatus> }) {
    this.errorMap = params.status;
  }

  /**
   * 获取验证规则
   */
  protected findRule = memoize((path: string) => {
    return findRule(this.rules, path);
  });

  protected getFormItemValidator = memoize((path: string) => {
    const rule = this.findRule(path);
    if (rule == null) {
      return NoopValidator;
    }

    const validate = ruleToValidator(path, rule);

    return (value: any) => {
      return validate(value);
    };
  });
}
