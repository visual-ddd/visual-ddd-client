import { makeObservable, observable, runInAction } from 'mobx';
import memoize from 'lodash/memoize';
import { cloneDeep, debounce } from '@wakeapp/utils';
import { command, derive, effect, makeAutoBindThis, mutation } from '@/lib/store';

import { BaseNode } from '../BaseNode';
import {
  findRule,
  isRequired,
  NoopValidator,
  normalizePath,
  normalizeRules,
  rulesToValidator,
  ruleToValidator,
  spreadPathPattern,
} from './utils';
import { FormRules, FormItemValidateStatus, FormRuleReportType } from './types';
import { BaseEditorStore } from '../BaseEditorStore';
import { BaseEditorModel } from '../BaseEditorModel';
import { ROOT_FIELD } from './constants';
import { StatusTree } from './StatusTree';

/**
 * 表单验证模型
 * TODO: 验证上下文
 * TODO: 验证性能优化
 */
export class FormModel {
  readonly node: BaseNode;

  private rules: FormRules;
  private store: BaseEditorStore;
  private statusTree: StatusTree;

  /**
   * 更新队列
   */
  private updateStatusQueue: [string, FormItemValidateStatus | undefined][] = [];

  /**
   * 验证子项更新队列
   */
  private validateItemQueue: Set<string> = new Set();

  get id() {
    return this.node.id;
  }

  /**
   * 所有属性
   */
  get properties() {
    return this.node.properties;
  }

  /**
   * 错误列表收集
   */
  @observable.shallow
  errorMap: Map<string, FormItemValidateStatus> = new Map();

  /**
   * 计算哪些属性被变更过
   */
  @observable.shallow
  private touchedMap: Map<string, boolean> = new Map();

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

  constructor(inject: { node: BaseNode; rules: FormRules; store: BaseEditorStore; editorModel: BaseEditorModel }) {
    this.node = inject.node;
    this.store = inject.store;

    // 规范化规则
    const clone = cloneDeep(inject.rules);
    normalizeRules(clone, () => ({
      model: this,
      editorModel: inject.editorModel,
      scope: inject.editorModel.scope.getMembers(),
    }));

    this.rules = clone;

    this.statusTree = new StatusTree({
      onAdd: (path, status) => {
        this.pushStatusUpdateQueue(path, status);
      },
      onUpdate: (path, status) => {
        this.pushStatusUpdateQueue(path, status);
      },
      onRemove: path => {
        this.pushStatusUpdateQueue(path, undefined);
      },
    });

    makeAutoBindThis(this);
    makeObservable(this);
  }

  /**
   * 是否变更过
   * @param path
   * @returns
   */
  isTouched(path: string) {
    return !!this.touchedMap.get(path);
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
    if (!this.isTouched(path)) {
      this.setTouched({ path, value: true });
    }
  }

  /**
   * 删除属性
   * @param path
   */
  @command('DELETE_PROPERTY')
  deleteProperty(path: string) {
    this.store.deleteNodeProperty({ node: this.node, path });
    this.statusTree.removeStatus(path, true);

    if (this.isTouched(path)) {
      this.setTouched({ path, value: false });
    }
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
  getAggregatedValidateStatus(path: string): FormItemValidateStatus[] {
    return this.statusTree.findRecursive(normalizePath(path));
  }

  /**
   * 指定字段是否为必填
   * @param path
   */
  isRequired = memoize((path: string) => {
    return isRequired(this.rules, path);
  });

  @effect('VALIDATE_ROOT')
  async validateRoot() {
    this.validateField(ROOT_FIELD);
  }

  /**
   * 验证指定字段
   */
  @effect('VALIDATE_FIELD')
  validateField(pathMaybeIncludePattern: string) {
    if (pathMaybeIncludePattern.includes('*')) {
      const paths = spreadPathPattern(pathMaybeIncludePattern, this.properties);
      for (const p of paths) {
        this.pushValidateItemQueue(p);
      }
    } else {
      this.pushValidateItemQueue(pathMaybeIncludePattern);
    }
  }

  /**
   * 递归验证指定字段
   * @returns
   */
  @effect('VALIDATE_FIELD_RECURSIVE')
  async validateFieldRecursive(path: string) {
    const np = normalizePath(path);
    const validate = this.getFormItemRecursiveValidator(np);
    const value = this.getProperty(np);

    const statusMap = await validate(value);

    // 清理
    this.statusTree.removeStatus(np, true);

    if (statusMap?.size) {
      for (const [path, status] of statusMap.entries()) {
        this.statusTree.addStatus(path, status);
      }
    }

    return !!statusMap?.size;
  }

  /**
   * 验证所有
   *
   * @returns 返回是否存在错误
   */
  @effect('VALIDATE_ALL')
  async validateAll(): Promise<boolean> {
    const validate = this.getFormValidator();

    const statusMap = await validate(this.node.properties);
    let hasError = false;

    this.statusTree.clearAll();

    if (statusMap?.size) {
      for (const [path, status] of statusMap.entries()) {
        this.statusTree.addStatus(path, status);
        if (status.errors.length) {
          hasError = true;
        }
      }
    }

    return hasError;
  }

  @mutation('FORM_MODEL:SET_TOUCHED')
  protected setTouched(params: { path: string; value: boolean }) {
    const { path, value } = params;
    this.touchedMap.set(path, value);
  }

  private async validateFieldInner(path: string) {
    const np = normalizePath(path);
    const validate = this.getFormItemValidator(np);
    const value = this.getProperty(np);

    const status = await validate(value);

    // 清理
    this.statusTree.removeStatus(np);
    // 添加状态
    if (status) {
      this.statusTree.addStatus(np, status);
    }
  }

  /**
   * 获取验证规则
   */
  private findRule = memoize((path: string) => {
    return findRule(this.rules, path);
  });

  /**
   * 获取当个字段的验证器
   */
  private getFormItemValidator = memoize((path: string) => {
    const rule = this.findRule(path);

    if (rule == null || rule.$self == null) {
      return NoopValidator;
    }

    const validate = ruleToValidator(path, rule.$self);

    return (value: any) => {
      return validate(value);
    };
  });

  /**
   * 获取全量验证器
   */
  private getFormValidator = memoize(() => {
    return rulesToValidator(this.rules);
  });

  /**
   * 获取递归验证子项的验证器
   */
  private getFormItemRecursiveValidator = memoize((path: string) => {
    const rule = this.findRule(path);

    if (rule == null) {
      return NoopValidator;
    }

    const np = normalizePath(path);
    const rules: FormRules = {
      fields: { [np]: rule },
    };

    const validator = rulesToValidator(rules);

    return ((value, options) => {
      return validator({ [np]: value }, options);
    }) as typeof validator;
  });

  /**
   * 子项更新队列，避免频繁触发验证，另外可以合并重复的验证
   * @param path
   */
  private pushValidateItemQueue = (path: string) => {
    this.validateItemQueue.add(path);

    this.flushValidateItemQueue();
  };

  private flushValidateItemQueue = debounce(() => {
    const queue = this.validateItemQueue;
    if (!queue.size) {
      return;
    }

    this.validateItemQueue = new Set();

    for (const path of queue) {
      this.validateFieldInner(path);
    }
  }, 300);

  /**
   * 状态更新队列
   */
  private pushStatusUpdateQueue = (path: string, status?: FormItemValidateStatus) => {
    this.updateStatusQueue.push([path, status]);

    this.flushStatusQueue();
  };

  /**
   * 状态更新
   */
  private flushStatusQueue = debounce(() => {
    const queue = this.updateStatusQueue;

    if (!queue.length) {
      return;
    }

    this.updateStatusQueue = [];

    runInAction(() => {
      for (const [path, status] of queue) {
        if (status) {
          this.errorMap.set(path, status);
        } else {
          this.errorMap.delete(path);
        }
      }
    });
  });
}
