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
export function verifyRedirect(from: string | undefined, launchInfo: LaunchInfo): VDSessionState | undefined {
  if (from == null) {
    return undefined;
  }

  try {
    const url = new URL(from, 'http://example.com');
    const path = url.pathname;

    // 系统管理员
    if (path.startsWith('/system') && launchInfo.isSysAdmin) {
      return { entry: VDSessionEntry.System, entryName: '系统管理', isManager: true };
    }

    // 组织管理员
    if (path.startsWith('/organization') && launchInfo.accountOrganizationInfoList?.length) {
      const org = launchInfo.accountOrganizationInfoList.find(i =>
        path.startsWith(`/organization/${i.organizationDTO.id}`)
      );

      if (org) {
        return {
          entry: VDSessionEntry.Organization,
          entryName: org.organizationDTO.name,
          entryId: org.organizationDTO.id,
          isManager: true,
        };
      }
    }

    // 团队
    if (path.startsWith('/team') && launchInfo.teamDTOList?.length) {
      const team = launchInfo.teamDTOList.find(i => path.startsWith(`/team/${i.teamDTO.id}`));

      if (team) {
        return {
          entry: VDSessionEntry.Team,
          entryName: team.teamDTO.name,
          entryId: team.teamDTO.id,
          isManager: !!team.isTeamAdmin,
        };
      }
    }
  } catch {
    // url parse error
    // ignore it
  }

  return undefined;
}
