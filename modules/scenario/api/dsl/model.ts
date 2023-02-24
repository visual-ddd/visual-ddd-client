import type { Doc as YDoc } from 'yjs';
import { QueryModelContainer } from '@/modules/domain/api/dsl/query-model';

import { YJS_FIELD_NAME } from '../../constants';

import { ScenarioDSL } from './interface';
import { ScenarioModelContainer } from './scenario-model';

export class DSLModel {
  private queryModel: QueryModelContainer;
  private scenarioModel: ScenarioModelContainer;

  constructor(doc: YDoc) {
    const scenarioMap = doc.getMap(YJS_FIELD_NAME.SCENARIO);
    const queryMap = doc.getMap(YJS_FIELD_NAME.SERVICE);

    this.scenarioModel = new ScenarioModelContainer(scenarioMap.toJSON());
    this.queryModel = new QueryModelContainer(queryMap.toJSON());
  }

  toDSL(): ScenarioDSL {
    return {
      domainDependencies: this.scenarioModel.toDSL(),
      serviceModel: this.queryModel.toDSL(),
    };
  }
}
