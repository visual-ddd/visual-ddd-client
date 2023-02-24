import { BaseEditorModel, BaseEditorModelOptions } from '@/lib/editor';
import { IDomainServiceStore } from './IDomainServiceStore';
import { IServiceStore } from './IServiceStore';
import { ScenarioValidateManager } from './ScenarioValidateManager';

export interface ScenarioEditorModelOptions extends BaseEditorModelOptions {
  serviceStore: IServiceStore;
  domainServiceStore: IDomainServiceStore;
}

/**
 * 业务场景设计器
 */
export class ScenarioEditorModel extends BaseEditorModel {
  serviceStore: IServiceStore;
  domainServiceStore: IDomainServiceStore;
  validateManager: ScenarioValidateManager;

  constructor(options: ScenarioEditorModelOptions) {
    super(options);

    this.serviceStore = options.serviceStore;
    this.domainServiceStore = options.domainServiceStore;
    this.validateManager = new ScenarioValidateManager({ event: this.event, editorModel: this });
  }
}
