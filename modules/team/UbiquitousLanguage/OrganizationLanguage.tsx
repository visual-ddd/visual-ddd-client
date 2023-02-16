import { observer } from 'mobx-react';
import { useRouter } from 'next/router';
import { IMMUTABLE_REQUEST_CONFIG, useRequestByGet } from '@/modules/backend-client';

import { TeamDetail } from '@/modules/organization/types';
import { useLayoutTitle } from '@/modules/Layout';

import { LanguageScope } from './types';
import Language from './Language';

/**
 * 团队统一语言
 */
export const OrganizationLanguage = observer(function OrganizationLanguage() {
  const router = useRouter();
  const teamId = router.query.id as string | undefined;
  const { data } = useRequestByGet<TeamDetail>(
    router.isReady ? `/wd/visual/web/team/team-detail-query?id=${teamId}` : null,
    undefined,
    IMMUTABLE_REQUEST_CONFIG
  );

  useLayoutTitle('组织统一语言');

  return <Language ready={!!data} id={data?.organizationId} scope={LanguageScope.ORGANIZATION_LANGUAGE} />;
});

export default OrganizationLanguage;
