import { command, derive, effect, makeAutoBindThis, mutation, runInCommand } from '@/lib/store';
import { makeObservable, observable } from 'mobx';
import { getRules } from '../Shape';

import { BaseEditorEvent } from './BaseEditorEvent';
import { BaseEditorStore } from './BaseEditorStore';
import { BaseNode } from './BaseNode';
import { FormModel } from './FormModel';

/**
 * 表单验证状态
 */
export class BaseEditorFormStore {
  private event: BaseEditorEvent;
  private store: BaseEditorStore;

  @observable.shallow
  private formModels: Map<string, FormModel> = new Map();

  @derive
  get hasError() {
    for (const model of this.formModels.values()) {
      if (model.hasError) {
        return true;
      }
    }

    return false;
  }

  constructor(inject: { event: BaseEditorEvent; store: BaseEditorStore }) {
    this.event = inject.event;
    this.store = inject.store;

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
    return this.formModels.get(typeof id === 'object' ? id.id : id);
  }

  /**
   * 验证所有模型
   */
  @effect('FORM_STORE:VALIDATE')
  async validate() {
    const results = await Promise.all(Array.from(this.formModels.values()).map(m => m.validateAll()));

    return results.some(Boolean);
  }

  @command('FORM_STORE:ADD_NODE')
  protected handleAddNode(params: { node: BaseNode }) {
    const { node } = params;
    const rules = getRules(node.name);

    if (rules) {
      this.addFormModel({
        node,
        model: new FormModel({
          node,
          rules,
          store: this.store,
        }),
      });
    }
  }

  @command('FORM_STORE:REMOVE_NODE')
  protected handleRemoveNode(params: { node: BaseNode }) {
    const { node } = params;

    if (!this.formModels.has(node.id)) {
      return;
    }

    const model = this.formModels.get(node.id)!;
    // 删除可以延迟一些
    requestAnimationFrame(() => {
      // 有可能重新创建了新的 node
      const currentModel = this.formModels.get(node.id);
      if (currentModel === model) {
        runInCommand(undefined, () => {
          this.removeFormModel({ node });
        });
      }
    });
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
}
