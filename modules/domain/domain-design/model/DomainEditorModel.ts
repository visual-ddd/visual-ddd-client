import { BaseEditorModel, BaseEditorModelOptions } from '@/lib/editor';
import { DomainObjectStore } from './DomainObjectStore';
import { DomainEditorViewModel } from './DomainEditorViewModel';
import type { IDomainGeneratorHandler } from '../../generator';

export interface DomainEditorModelOptions extends BaseEditorModelOptions {
  domainGenerator?: IDomainGeneratorHandler;
}

/**
 * 领域建模编辑器模型
 */
export class DomainEditorModel extends BaseEditorModel {
  domainObjectStore: DomainObjectStore;
  domainEditorViewModel: DomainEditorViewModel;
  domainGenerator?: IDomainGeneratorHandler;

  constructor(options: DomainEditorModelOptions) {
    super(options);

    this.domainObjectStore = new DomainObjectStore({ event: this.event, editorModel: this });
    this.domainEditorViewModel = new DomainEditorViewModel({ scope: this.scope });
    this.domainGenerator = options.domainGenerator;
  }
}
