import { BaseEditorModel, BaseEditorModelOptions } from '@/lib/editor';
import { DomainObjectStore } from './DomainObjectStore';
import { DomainEditorViewModel } from './DomainEditorViewModel';

/**
 * 领域建模编辑器模型
 */
export class DomainEditorModel extends BaseEditorModel {
  domainObjectStore: DomainObjectStore;
  domainEditorViewModel: DomainEditorViewModel;

  constructor(options: BaseEditorModelOptions) {
    super(options);

    this.domainObjectStore = new DomainObjectStore({ event: this.event, editorModel: this });
    this.domainEditorViewModel = new DomainEditorViewModel();
  }
}
