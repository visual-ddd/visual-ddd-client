import { BaseEditorModel, BaseEditorModelOptions } from '@/lib/editor';
import { DomainObjectStore } from './DomainObjectStore';

/**
 * 领域建模编辑器模型
 */
export class DomainEditorModel extends BaseEditorModel {
  domainObjectStore: DomainObjectStore;

  constructor(options: BaseEditorModelOptions) {
    super(options);

    this.domainObjectStore = new DomainObjectStore({ event: this.event, editorModel: this });
  }
}
