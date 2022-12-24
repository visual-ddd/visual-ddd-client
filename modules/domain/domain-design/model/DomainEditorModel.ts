import { BaseEditorModel, BaseEditorModelOptions } from '@/lib/editor';
import { DomainObjectContainer } from './DomainObjectContainer';

/**
 * 领域建模编辑器模型
 */
export class DomainEditorModel extends BaseEditorModel {
  domainObjectContainer: DomainObjectContainer;

  constructor(options: Omit<BaseEditorModelOptions, 'scopeId'>) {
    super({ ...options, scopeId: 'domain' });

    this.domainObjectContainer = new DomainObjectContainer({ event: this.event });
  }
}
