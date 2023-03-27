import { derive } from '@/lib/store';
import type { NameDSL } from '@/modules/domain/domain-design/dsl';

import type { IServiceStore } from '../../scenario-design';
import type { DomainEditorModel } from '../../service-design';
import { ScenarioDesignerTabs } from './constants';

import { ScenarioDesignerModel } from './ScenarioDesignerModel';

export class ScenarioServiceStore implements IServiceStore {
  private model: DomainEditorModel;
  private designer: ScenarioDesignerModel;

  constructor(inject: { serviceEditorModel: DomainEditorModel; designer: ScenarioDesignerModel }) {
    this.model = inject.serviceEditorModel;
    this.designer = inject.designer;
  }

  @derive
  get list() {
    return this.model.domainObjectStore.queries.map(i => i.dsl);
  }

  getObjectById(id: string): NameDSL | undefined {
    return this.model.domainObjectStore.getObjectById(id)?.dsl as NameDSL;
  }

  /**
   *
   * @param id
   */
  openObjectById(id: string): void {
    this.designer.setActiveTab({
      tab: ScenarioDesignerTabs.Service,
    });

    // 聚焦
    this.model.propertyLocationObserver.emit({
      nodeId: id,
      reason: 'scenario-designer-focus',
    });
  }
}
