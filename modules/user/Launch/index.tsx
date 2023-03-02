import { ArrowRightOutlined } from '@ant-design/icons';
import { useRouter } from 'next/router';
import classNames from 'classnames';
import { VDSessionEntry, VDSessionState } from '@/modules/session/server';
import { request } from '@/modules/backend-client';
import { Alert, Button, Space } from 'antd';
import { useSession } from '@/modules/session';

import s from './index.module.scss';
import { Layout } from '../Login/Layout';
import { SystemIcon } from './SystemIcon';
import { OrganizationIcon } from './OrganizationIcon';
import { TeamIcon } from './TeamIcon';
import { LaunchInfo } from './types';
import { createRedirectUrl } from './utils';

export * from './types';
export * from './utils';

export interface LaunchProps {
  data: LaunchInfo;
}

/**
 * 启动页
 * @returns
 */
export function Launch({ data }: LaunchProps) {
  const router = useRouter();
  const session = useSession();
  const organizations = data.accountOrganizationInfoList;
  const isEmpty = !data.isSysAdmin && !organizations.length && !data.teamDTOList.length;

  const handleRefresh = () => {
    router.replace(router.asPath);
  };

  const handleLogout = async () => {
    await request.requestByPost('/api/logout');
    router.push('/login');
  };

  const handleGo = async (params: VDSessionState) => {
    // 缓存启动配置
    await request.requestByPost('/api/update-entry', params);

    session.reload();
    const url = createRedirectUrl(params);
    router.push(url);
  };

  return (
    <Layout title="启动">
      <div className={classNames('vd-launch', s.root)}>
        <Layout.H1>选择入口</Layout.H1>
        <div className={s.groups}>
          {isEmpty && (
            <Alert
              message="抱歉"
              description={
                <div>
                  您暂时没有加入任何团队，请通知相关团队负责人，邀请进入
                  <div>
                    <Space className="u-mt-sm">
                      <Button type="primary" onClick={handleRefresh}>
                        刷新看看
                      </Button>
                      <Button onClick={handleLogout}>退出登录</Button>
                    </Space>
                  </div>
                </div>
              }
              type="info"
              showIcon
            />
          )}
          {!!data.isSysAdmin && (
            <div
              className={classNames(s.head, s.hoverable)}
              onClick={() => handleGo({ entry: VDSessionEntry.System, isManager: true, entryName: '系统管理' })}
            >
              <span className={s.logo}>
                <SystemIcon />
              </span>
              系统管理
              <ArrowRightOutlined className={s.arrow} />
            </div>
          )}

          {!!organizations?.length && (
            <>
              <div className={s.head}>
                <span className={s.logo}>
                  <OrganizationIcon />
                </span>
                组织管理
              </div>
              {organizations.map(item => {
                return (
                  <div
                    className={s.item}
                    key={item.organizationDTO.id}
                    onClick={() =>
                      handleGo({
                        entry: VDSessionEntry.Organization,
                        entryId: item.organizationDTO.id,
                        isManager: item.isOrganizationAdmin,
                        entryName: item.organizationDTO.name,
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
                        entryName: item.teamDTO.name,
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
