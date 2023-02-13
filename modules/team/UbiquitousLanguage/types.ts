import { UbiquitousLanguageItem } from '@/modules/domain/ubiquitous-language-design/types';

export interface LanguageItem extends UbiquitousLanguageItem {
  id: string;
}

export enum LanguageScope {
  ORGANIZATION_LANGUAGE = 1,
  TEAM_LANGUAGE = 2,
  DOMAIN_LANGUAGE = 3,
}
