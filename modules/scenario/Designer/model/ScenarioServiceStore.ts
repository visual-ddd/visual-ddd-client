import { derive } from '@/lib/store';
import type { NameDSL } from '@/modules/domain/domain-design/dsl';
import type { IServiceStore } from '../../scenario-design';
import type { DomainEditorModel } from '../../service-design';

export class ScenarioServiceStore implements IServiceStore {
  private model: DomainEditorModel;
  constructor(inject: { serviceEditorModel: DomainEditorModel }) {
    this.model = inject.serviceEditorModel;
  }

  @derive
  get list() {
    return this.model.domainObjectStore.queries.map(i => i.dsl);
  }

  getObjectById(id: string): NameDSL | undefined {
    return this.model.domainObjectStore.getObjectById(id)?.dsl as NameDSL;
  }
}
