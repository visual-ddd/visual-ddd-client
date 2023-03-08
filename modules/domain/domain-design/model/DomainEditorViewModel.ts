import { BaseEditorScope } from '@/lib/editor';
import { makeAutoBindThis, mutation } from '@/lib/store';
import localforage from 'localforage';
import { debounce } from '@wakeapp/utils';
import { makeObservable, observable, toJS } from 'mobx';

import { RelationShipDSL } from '../dsl';

export class DomainEditorViewModel {
  private scope: BaseEditorScope;
  private getCacheKey() {
    return `DomainEditorViewModel:${this.scope.scopeId}`;
  }

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

  constructor(inject: { scope: BaseEditorScope }) {
    this.scope = inject.scope;

    makeObservable(this);
    makeAutoBindThis(this);

    this.initial();
  }

  @mutation('DOMAIN:VIEW:SET_RELATIONSHIP_VISIBLE', false)
  setRelationShipVisible(relationShipVisible: RelationShipDSL[]) {
    this.relationShipVisible = relationShipVisible;

    this.save();
  }

  private async initial() {
    const state = await localforage.getItem<RelationShipDSL[]>(this.getCacheKey());

    if (state) {
      this.setRelationShipVisible(state);
    }
  }

  private save = debounce(() => {
    localforage.setItem(this.getCacheKey(), toJS(this.relationShipVisible));
  }, 1000);
}
