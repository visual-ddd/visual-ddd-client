import { observer } from 'mobx-react';
import { useRouter } from 'next/router';
import { useLayoutTitle } from '@/modules/Layout';

import { LanguageScope } from './types';
import Language from './Language';

/**
 * 团队统一语言
 */
export const TeamLanguage = observer(function TeamLanguage() {
  const router = useRouter();
  const teamId = router.query.id as string | undefined;

  useLayoutTitle('团队统一语言');

  return <Language ready={router.isReady} id={teamId} scope={LanguageScope.TEAM_LANGUAGE} />;
});

export default TeamLanguage;
