import { makeAutoBindThis, mutation } from '@/lib/store';
import { makeObservable, observable } from 'mobx';

import { RelationShipDSL } from '../dsl';

export class DomainEditorViewModel {
  /**
   * 关联关系显示
   */
  @observable
  relationShipVisible: RelationShipDSL[] = [
    RelationShipDSL.Aggregation,
    RelationShipDSL.Association,
    // RelationShipDSL.Composition,
    RelationShipDSL.Dependency,
  ];

  constructor() {
    makeObservable(this);
    makeAutoBindThis(this);
  }

  @mutation('DOMAIN:VIEW:SET_RELATIONSHIP_VISIBLE', false)
  setRelationShipVisible(relationShipVisible: RelationShipDSL[]) {
    this.relationShipVisible = relationShipVisible;
  }
}
