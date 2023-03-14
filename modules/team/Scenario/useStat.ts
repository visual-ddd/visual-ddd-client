import type { ScenarioDSL } from '@/modules/scenario/api/dsl/interface';
import uniq from 'lodash/uniq';
import { useMemo } from 'react';

export function useStat(dsl?: ScenarioDSL) {
  return useMemo(() => {
    if (dsl == null) {
      return;
    }

    return {
      services: dsl.serviceModel.queries.length,
      domain: uniq(dsl.domainDependencies.filter(i => i.teamId == null && i.domainId).map(i => i.domainId)).length,
      team: uniq(dsl.domainDependencies.filter(i => i.teamId != null && i.domainId).map(i => i.teamId)).length,
    };
  }, [dsl]);
}
