import { request } from '@/modules/backend-client';
import { computed, makeObservable, observable, runInAction } from 'mobx';
import { AppSimple, DomainSimple, ScenarioSimple } from '../types';

const PAGE_SIZE = 1000;

export class TeamLayoutModel {
  private teamId: string;

  /**
   * 业务域列表
   */
  @observable
  domainList: DomainSimple[] = [];

  /**
   * 应用列表
   */
  @observable
  appList: AppSimple[] = [];

  /**
   * 业务场景列表
   */
  @observable
  scenarioList: ScenarioSimple[] = [];

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

  @computed
  get scenarioListMenu() {
    return this.scenarioList.map(i => ({
      name: i.name,
      route: `/team/${this.teamId}/scenario/${i.id}`,
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

  refreshScenarioList = () => {
    this.getScenarioList();
  };

  initial() {
    this.getDomainList();
    this.getAppList();
    this.getScenarioList();
  }

  private getDomainList = async () => {
    const list = await request.requestByGet<DomainSimple[]>('/wd/visual/web/domain-design/domain-design-page-query', {
      teamId: this.teamId,
      pageNo: 1,
      pageSize: PAGE_SIZE,
    });

    runInAction(() => {
      this.domainList = list;
    });
  };

  private getAppList = async () => {
    const list = await request.requestByGet<AppSimple[]>('/wd/visual/web/application/application-page-query', {
      teamId: this.teamId,
      pageNo: 1,
      pageSize: PAGE_SIZE,
    });

    runInAction(() => {
      this.appList = list;
    });
  };

  private getScenarioList = async () => {
    const list = await request.requestByGet<ScenarioSimple[]>(
      '/wd/visual/web/business-scene/business-scene-page-query',
      {
        teamId: this.teamId,
        pageNo: 1,
        pageSize: PAGE_SIZE,
      }
    );

    runInAction(() => {
      this.scenarioList = list;
    });
  };
}
