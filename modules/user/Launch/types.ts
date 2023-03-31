import type { TeamDetail } from '@/modules/organization/types';
import type { OrganizationDetail } from '@/modules/system/types';

export interface TeamDTOList {
  teamDTO: TeamDetail;
  isTeamAdmin: boolean;
}

export interface AccountOrganizationInfoList {
  organizationDTO: OrganizationDetail;
  isOrganizationAdmin: boolean;
}

export interface LaunchInfo {
  id: number;
  isSysAdmin: boolean;
  accountTeamInfoList: TeamDTOList[];
  accountOrganizationInfoList: AccountOrganizationInfoList[];
}
