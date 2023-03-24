import type { BusinessDomainDSL } from '@/modules/domain/api/dsl/interface';
import { memo, useMemo } from 'react';
import { extraApi } from './extra-api';
import { ObjectCard } from './ObjectCard';

/**
 * API 文档
 */
export interface DocProps {
  dsl: BusinessDomainDSL;
}

export const APiDoc = memo((props: DocProps) => {
  const { dsl } = props;
  const apis = useMemo(() => {
    return extraApi(dsl);
  }, [dsl]);

  const referencesKeys = useMemo(() => Object.keys(apis.references), [apis.references]);

  return (
    <div>
      <section>
        <h3>命令</h3>
        {apis.commands.map(i => {
          return <ObjectCard key={i.uuid} object={i} references={apis.references} />;
        })}
      </section>

      {!!apis.queries.length && (
        <section>
          <h3>查询</h3>
          {apis.queries.map(i => {
            return <ObjectCard key={i.uuid} object={i} references={apis.references} />;
          })}
        </section>
      )}

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

APiDoc.displayName = 'APiDoc';
