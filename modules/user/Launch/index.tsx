import { ArrowRightOutlined } from '@ant-design/icons';
import { useRouter } from 'next/router';
import classNames from 'classnames';
import { VDSessionEntry, VDSessionState } from '@/modules/session/server';
import { request } from '@/modules/backend-client';
import { Alert } from 'antd';

import s from './index.module.scss';
import { Layout } from '../Login/Layout';
import { SystemIcon } from './SystemIcon';
import { OrganizationIcon } from './OrganizationIcon';
import { TeamIcon } from './TeamIcon';

interface TeamDTO {
  id: number;
  createTime: string;
  updateTime: string;
  createBy: string;
  updateBy: string;
  organizationId: number;
  name: string;
  description: string;
  teamManagerId: number;
}

interface TeamDTOList {
  teamDTO: TeamDTO;
  isTeamAdmin: boolean;
}

interface OrganizationDTO {
  id: number;
  createTime: string;
  updateTime: string;
  createBy: string;
  updateBy: string;
  organizationManagerId: number;
  name: string;
  description: string;
}

interface AccountOrganizationInfoList {
  organizationDTO: OrganizationDTO;
  isOrganizationAdmin: boolean;
}

export interface LaunchInfo {
  id: number;
  isSysAdmin: boolean;
  teamDTOList: TeamDTOList[];
  accountOrganizationInfoList: AccountOrganizationInfoList[];
}

export interface LaunchProps {
  data: LaunchInfo;
}

/**
 * 启动页
 * @returns
 */
export function Launch({ data }: LaunchProps) {
  const router = useRouter();

  const handleGo = async (params: VDSessionState) => {
    // 缓存启动配置
    await request.requestByPost('/api/update-entry', params);

    switch (params.entry) {
      case VDSessionEntry.System:
        router.push(`/system`);
        break;
      case VDSessionEntry.Organization:
        router.push(`/organization/${params.entryId}`);
        break;
      case VDSessionEntry.Team:
        router.push(`/team/${params.entryId}`);
        break;
    }
  };

  return (
    <Layout title="启动">
      <div className={classNames('vd-launch', s.root)}>
        <Layout.H1>选择入口</Layout.H1>
        <div className={s.groups}>
          {!data.isSysAdmin && !data.accountOrganizationInfoList.length && !data.teamDTOList.length && (
            <Alert message="暂时没有加入任何团队，请通知相关团队负责人，邀请进入" type="error" />
          )}
          {!!data.isSysAdmin && (
            <div
              className={classNames(s.head, s.hoverable)}
              onClick={() => handleGo({ entry: VDSessionEntry.System, isManager: true })}
            >
              <span className={s.logo}>
                <SystemIcon />
              </span>
              系统管理
              <ArrowRightOutlined className={s.arrow} />
            </div>
          )}

          {!!data.accountOrganizationInfoList.length && (
            <>
              <div className={s.head}>
                <span className={s.logo}>
                  <OrganizationIcon />
                </span>
                组织管理
              </div>
              {data.accountOrganizationInfoList.map(item => {
                return (
                  <div
                    className={s.item}
                    key={item.organizationDTO.id}
                    onClick={() =>
                      handleGo({
                        entry: VDSessionEntry.Organization,
                        entryId: item.organizationDTO.id,
                        isManager: item.isOrganizationAdmin,
                      })
                    }
                  >
                    {item.organizationDTO.name}
                    <ArrowRightOutlined className={s.arrow} />
                  </div>
                );
              })}
            </>
          )}

          {!!data.teamDTOList.length && (
            <>
              <div className={s.head}>
                <span className={s.logo}>
                  <TeamIcon />
                </span>
                团队
              </div>
              {data.teamDTOList.map(item => {
                return (
                  <div
                    className={s.item}
                    key={item.teamDTO.id}
                    onClick={() =>
                      handleGo({
                        entry: VDSessionEntry.Team,
                        entryId: item.teamDTO.id,
                        isManager: item.isTeamAdmin,
                      })
                    }
                  >
                    {item.teamDTO.name}
                    <ArrowRightOutlined className={s.arrow} />
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
