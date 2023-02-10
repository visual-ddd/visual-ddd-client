import { request } from '@/modules/backend-client';
import { computed, makeObservable, observable, runInAction } from 'mobx';
import { DomainSimple } from '../types';

export class TeamLayoutModel {
  private teamId: string;

  @observable
  domainList: DomainSimple[] = [];

  @computed
  get domainListMenu() {
    return this.domainList.map(i => ({
      name: i.name,
      route: `/team/${this.teamId}/domain/${i.id}`,
    }));
  }

  constructor(inject: { teamId: string }) {
    this.teamId = inject.teamId;

    makeObservable(this);
  }

  refreshDomainList = () => {
    this.getDomainList();
  };

  initial() {
    this.getDomainList();
  }

  private getDomainList = async () => {
    const list = await request.requestByGet<DomainSimple[]>('/wd/visual/web/domain-design/domain-design-page-query', {
      teamId: this.teamId,
      pageNo: 1,
      pageSize: 1000,
    });

    runInAction(() => {
      this.domainList = list;
    });
  };
}
