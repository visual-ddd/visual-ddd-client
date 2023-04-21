import { command, derive, effect, makeAutoBindThis, mutation } from '@/lib/store';
import { debounce } from '@wakeapp/utils';
import { makeObservable, observable } from 'mobx';
import { tryDispose } from '@/lib/utils';

import { getValidator } from '../Shape';

import { BaseEditorEvent } from './BaseEditorEvent';
import { BaseEditorModel } from './BaseEditorModel';
import { BaseEditorStore } from './BaseEditorStore';
import { BaseNode } from './BaseNode';
import { FormModel, FormRules } from './FormModel';
import { IValidateStatus } from '@/lib/core';

const DEFAULT_RULES: FormRules = {
  fields: {},
};

/**
 * 表单验证状态
 */
export class BaseEditorFormStore implements IValidateStatus {
  private event: BaseEditorEvent;
  private store: BaseEditorStore;
  private editorModel: BaseEditorModel;

  @observable.shallow
  private formModels: Map<string, FormModel> = new Map();

  @observable.shallow
  private formModelsWillRemove: Map<string, FormModel> = new Map();

  @derive
  get nodesHasIssue() {
    return Array.from(this.formModels.values()).filter(m => m.hasIssue);
  }

  @derive
  get hasIssue() {
    return !!this.nodesHasIssue.length;
  }

  @derive
  get hasError() {
    for (const model of this.nodesHasIssue) {
      if (model.hasError) {
        return true;
      }
    }

    return false;
  }

  @derive
  get hasWarning() {
    for (const model of this.nodesHasIssue) {
      if (model.hasWarning) {
        return true;
      }
    }

    return false;
  }

  @derive
  get hasException() {
    return this.hasIssue && (this.hasError || this.hasWarning);
  }

  @derive
  get hasTip() {
    return this.hasIssue && !this.hasException;
  }

  constructor(inject: { event: BaseEditorEvent; store: BaseEditorStore; editorModel: BaseEditorModel }) {
    this.event = inject.event;
    this.store = inject.store;
    this.editorModel = inject.editorModel;

    makeAutoBindThis(this);
    makeObservable(this);

    this.event.on('NODE_CREATED', this.handleAddNode);
    this.event.on('NODE_REMOVED', this.handleRemoveNode);
  }

  /**
   * 获取表单模型
   * @param id
   */
  getFormModel(id: string | BaseNode): FormModel | undefined {
    const key = typeof id === 'object' ? id.id : id;

    return this.formModels.get(key) || this.formModelsWillRemove.get(key);
  }

  /**
   * 验证所有模型
   * 如果验证失败则返回 true
   */
  @effect('FORM_STORE:VALIDATE')
  async validate() {
    const results = await Promise.all(Array.from(this.formModels.values()).map(m => m.validateAll()));

    return results.some(Boolean);
  }

  @command('FORM_STORE:ADD_NODE')
  protected handleAddNode(params: { node: BaseNode }) {
    const { node } = params;
    const validator = getValidator(node.name);

    this.addFormModel({
      node,
      model: new FormModel({
        node,
        rules: validator?.rules ?? DEFAULT_RULES,
        store: this.store,
        editorModel: this.editorModel,
        configuration: validator?.validatorConfiguration,
      }),
    });
  }

  @command('FORM_STORE:REMOVE_NODE')
  protected handleRemoveNode(params: { node: BaseNode }) {
    const { node } = params;

    if (!this.formModels.has(node.id)) {
      return;
    }

    const currentModel = this.formModels.get(node.id);
    if (currentModel) {
      const willRemove = this.formModelsWillRemove.get(currentModel.id);

      this.formModelsWillRemove.set(currentModel.id, currentModel);
      this.formModels.delete(currentModel.id);

      if (willRemove) {
        tryDispose(willRemove);
      }

      this.gc();
    }
  }

  @mutation('FORM_STORE:ADD_FORM_MODEL')
  protected addFormModel(params: { node: BaseNode; model: FormModel }) {
    const { node, model } = params;
    this.formModels.set(node.id, model);
  }

  @mutation('FORM_STORE:REMOVE_FORM_MODEL')
  protected removeFormModel(params: { node: BaseNode }) {
    this.formModels.delete(params.node.id);
  }

  private gc = debounce(() => {
    this.formModelsWillRemove.forEach(m => tryDispose(m));
    this.formModelsWillRemove.clear();
  }, 2000);
}
