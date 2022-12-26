import { BaseEditorModel, BaseEditorModelOptions } from '@/lib/editor';
import { DomainObjectStore } from './DomainObjectStore';

/**
 * 领域建模编辑器模型
 */
export class DomainEditorModel extends BaseEditorModel {
  domainObjectStore: DomainObjectStore;

  constructor(options: Omit<BaseEditorModelOptions, 'scopeId'>) {
    super({ ...options, scopeId: 'domain' });

    this.domainObjectStore = new DomainObjectStore({ event: this.event, editorModel: this });
  }
}
