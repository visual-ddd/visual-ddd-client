import { request } from '@/modules/backend-client';
import { computed, makeObservable, observable, runInAction } from 'mobx';
import { AppSimple, DomainSimple } from '../types';

export class TeamLayoutModel {
  private teamId: string;

  @observable
  domainList: DomainSimple[] = [];

  @observable
  appList: AppSimple[] = [];

  @computed
  get domainListMenu() {
    return this.domainList.map(i => ({
      name: i.name,
      route: `/team/${this.teamId}/domain/${i.id}`,
    }));
  }

  @computed
  get appListMenu() {
    return this.appList.map(i => ({
      name: i.name,
      route: `/team/${this.teamId}/app/${i.id}`,
    }));
  }

  constructor(inject: { teamId: string }) {
    this.teamId = inject.teamId;

    makeObservable(this);
  }

  refreshDomainList = () => {
    this.getDomainList();
  };

  refreshAppList = () => {
    this.getAppList();
  };

  initial() {
    this.getDomainList();
    this.getAppList();
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

  private getAppList = async () => {
    const list = await request.requestByGet<AppSimple[]>('/wd/visual/web/application/application-page-query', {
      teamId: this.teamId,
      pageNo: 1,
      pageSize: 1000,
    });

    runInAction(() => {
      this.appList = list;
    });
  };
}
