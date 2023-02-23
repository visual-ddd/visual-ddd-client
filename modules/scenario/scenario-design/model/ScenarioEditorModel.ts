import { BaseEditorModel, BaseEditorModelOptions } from '@/lib/editor';
import { IServiceStore } from './IServiceStore';

export interface ScenarioEditorModelOptions extends BaseEditorModelOptions {
  serviceStore: IServiceStore;
}

/**
 * 业务场景设计器
 */
export class ScenarioEditorModel extends BaseEditorModel {
  serviceStore: IServiceStore;

  constructor(options: ScenarioEditorModelOptions) {
    super(options);

    this.serviceStore = options.serviceStore;
  }
}
