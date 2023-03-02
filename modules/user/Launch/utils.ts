import { VDSessionEntry, VDSessionState } from '@/modules/session/types';
import type { LaunchInfo } from './types';

export function createRedirectUrl(params: VDSessionState) {
  switch (params.entry) {
    case VDSessionEntry.System:
      return `/system`;
      break;
    case VDSessionEntry.Organization:
      return `/organization/${params.entryId}`;
    case VDSessionEntry.Team:
      return `/team/${params.entryId}`;
  }
}

/**
 * 检查是否支持跳转
 * @param from
 * @param launchInfo
 */
export function verifyRedirect(from: string | undefined, launchInfo: LaunchInfo): boolean {
  if (from == null) {
    return false;
  }

  try {
    const url = new URL(from, 'http://example.com');
    const path = url.pathname;

    // 系统管理员
    if (path.startsWith('/system') && launchInfo.isSysAdmin) {
      return true;
    }

    // 组织管理员
    if (path.startsWith('/organization') && launchInfo.accountOrganizationInfoList?.length) {
      return launchInfo.accountOrganizationInfoList.some(i => path.startsWith(`/organization/${i.organizationDTO.id}`));
    }

    // 团队
    if (path.startsWith('/team') && launchInfo.teamDTOList?.length) {
      return launchInfo.teamDTOList.some(i => path.startsWith(`/team/${i.teamDTO.id}`));
    }

    return false;
  } catch (err) {
    return false;
  }
}
