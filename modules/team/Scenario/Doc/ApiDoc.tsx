import type { ScenarioDSL } from '@/modules/scenario/api/dsl/interface';
import { NoopArray } from '@wakeapp/utils';
import { memo, useMemo } from 'react';
import { extraApi } from '../../Domain/ApiDoc/extra-api';
import { ObjectCard } from '../../Domain/ApiDoc/ObjectCard';

export interface ApiDocProps {
  dsl: ScenarioDSL;
}

export const ApiDoc = memo((props: ApiDocProps) => {
  const { dsl } = props;
  const apis = useMemo(() => {
    // mock business domain dsl
    return extraApi({
      domainModel: { aggregates: NoopArray },
      dataModel: { dataObjects: NoopArray, references: NoopArray },
      queryModel: dsl.serviceModel,
      objectMapper: {
        mappers: NoopArray,
      },
    });
  }, [dsl]);

  const referencesKeys = useMemo(() => Object.keys(apis.references), [apis.references]);

  return (
    <div>
      <section>
        {apis.queries.map(i => {
          return <ObjectCard key={i.uuid} object={i} references={apis.references}></ObjectCard>;
        })}
      </section>

      {!!referencesKeys.length && (
        <section>
          <h3>引用对象</h3>
          {referencesKeys.map(id => {
            return <ObjectCard key={id} object={apis.references[id]} references={apis.references} />;
          })}
        </section>
      )}
    </div>
  );
});

ApiDoc.displayName = 'ApiDoc';
