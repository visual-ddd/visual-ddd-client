import { VDSessionEntry, VDSessionState } from '@/modules/session/types';
import type { LaunchInfo } from './types';
import type { TeamDetail } from '@/modules/organization/types';
import { ENTRY_PREFIX, PAGE_LAUNCH } from '@/modules/session/config';

/**
 * 是否为入口路径
 * @param path
 * @returns
 */
export function isEntry(path: string) {
  return ENTRY_PREFIX.some(i => path.startsWith(i));
}

/**
 * 是否为启动页
 * @param path
 * @returns
 */
export function isLaunch(path: string) {
  return path.startsWith(PAGE_LAUNCH);
}

export function normalizeLaunchInfo(launchInfo: LaunchInfo) {
  launchInfo.accountOrganizationInfoList = launchInfo.accountOrganizationInfoList?.filter(i => i.isOrganizationAdmin);

  return launchInfo;
}

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

const ORGANIZATION_REG = /\/organization\/([^/\s]+)/;
const TEAM_REG = /\/team\/([^/\s]+)/;
// 缓存团队信息，团队信息的结构是基本不变的
const TEAM_INFO_CACHE: Map<string, TeamDetail> = new Map();

export function getOrganizationIdFromPath(path: string) {
  const match = path.match(ORGANIZATION_REG);
  return match?.[1];
}

export function getTeamIdFromPath(path: string) {
  const match = path.match(TEAM_REG);
  return match?.[1];
}

/**
 * 检查是否支持跳转
 * @param from
 * @param launchInfo
 */
export async function verifyRedirect(
  from: string | undefined,
  launchInfo: LaunchInfo,
  getTeamInfo?: (teamId: string | number) => Promise<TeamDetail>
): Promise<VDSessionState | undefined> {
  if (from == null) {
    return undefined;
  }

  try {
    const url = new URL(from, 'http://example.com');
    const path = url.pathname;
    const isSystemAdmin = launchInfo.isSysAdmin;

    // 系统管理员
    if (path.startsWith('/system') && isSystemAdmin) {
      return { entry: VDSessionEntry.System, entryName: '系统管理', isManager: true };
    }

    // 组织管理员
    if (path.startsWith('/organization')) {
      if (launchInfo.accountOrganizationInfoList?.length) {
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

      // 如果是系统管理员进入任何组织
      if (isSystemAdmin) {
        const orgId = getOrganizationIdFromPath(path);
        if (orgId) {
          return {
            entry: VDSessionEntry.Organization,
            entryName: `组织-${orgId}`,
            entryId: orgId,
            isManager: true,
          };
        }
      }
    }

    // 团队
    if (path.startsWith('/team')) {
      if (launchInfo.accountTeamInfoList?.length) {
        const team = launchInfo.accountTeamInfoList.find(i => path.startsWith(`/team/${i.teamDTO.id}`));

        if (team) {
          return {
            entry: VDSessionEntry.Team,
            entryName: team.teamDTO.name,
            entryId: team.teamDTO.id,
            isManager: !!team.isTeamAdmin,
          };
        }
      }

      // 如果是系统管理员，可以进入任何团队
      const teamId = getTeamIdFromPath(path);
      if (isSystemAdmin && teamId) {
        return {
          entry: VDSessionEntry.Team,
          entryName: `团队-${teamId}`,
          entryId: teamId,
          isManager: true,
        };
      }

      // 判断是否为团队管理员
      if (teamId && getTeamInfo && launchInfo.accountOrganizationInfoList?.length) {
        const teamInfo = TEAM_INFO_CACHE.get(teamId) ?? (await getTeamInfo(teamId));
        if (
          teamInfo &&
          launchInfo.accountOrganizationInfoList.some(
            i => String(i.organizationDTO.id) === String(teamInfo.organizationId)
          )
        ) {
          TEAM_INFO_CACHE.set(teamId, teamInfo);

          return {
            entry: VDSessionEntry.Team,
            entryName: teamInfo.name,
            entryId: teamInfo.id,
            isManager: true,
          };
        }
      }
    }
  } catch {
    // url parse error
    // ignore it
  }

  return undefined;
}
