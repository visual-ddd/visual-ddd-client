import type { UbiquitousLanguageCompletionItem } from '@/lib/components/UbiquitousLanguageCompletion';
import { useRequestByGet } from '@/modules/backend-client';
import { NoopArray } from '@wakeapp/utils';
import { useMemo } from 'react';

import { useTeamInfo } from '../Team';
import { LanguageItem, LanguageScope } from './types';

function getter(scope: LanguageScope, id?: string | number) {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useRequestByGet<LanguageItem[]>(
    scope && id
      ? `/wd/visual/web/universal-language/universal-language-page-query?pageNo=1&pageSize=10000&languageType=${scope}&identity=${id}`
      : null
  );
}

export function useGlobalUbiquitousLanguage() {
  const { data, teamId } = useTeamInfo();
  const org = getter(LanguageScope.ORGANIZATION_LANGUAGE, data?.organizationId);
  const team = getter(LanguageScope.TEAM_LANGUAGE, teamId);

  const rawList = useMemo<LanguageItem[]>(() => {
    return [...(org.data ?? NoopArray), ...(team.data ?? NoopArray)];
  }, [org.data, team.data]);

  const words = useMemo(() => {
    const words: Set<string> = new Set();

    const push = (value: string) => {
      value = value.trim();
      if (value) {
        words.add(value);
      }
    };

    for (const item of rawList) {
      push(item.conception);
      push(item.englishName);
    }

    return Array.from(words);
  }, [rawList]);

  const list = useMemo<UbiquitousLanguageCompletionItem[]>(() => {
    return rawList
      .filter(i => i.englishName && i.conception)
      .map(item => ({
        id: item.englishName,
        title: item.conception,
        description: item.definition,
      }));
  }, [rawList]);

  return { list, rawList, words };
}
