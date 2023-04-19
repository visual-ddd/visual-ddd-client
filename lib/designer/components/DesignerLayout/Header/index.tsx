import { VersionBadge } from '@/lib/components/VersionBadge';
import { IUser, VersionStatus } from '@/lib/core';
import { Avatar, Button, Divider, Space, Tooltip } from 'antd';
import { observer } from 'mobx-react';
import { useRouter } from 'next/router';
import { CollaborationDescription, HistoryViewModal } from '@/lib/designer';
import { HistoryOutlined } from '@ant-design/icons';

import s from './index.module.scss';
import { CollabStatus } from './CollabStatus';

export interface DesignerHeaderProps {
  name?: React.ReactNode;
  version?: string;
  versionStatus?: VersionStatus;
  title?: React.ReactNode;
  readonly?: boolean;
  saveTooltip?: React.ReactNode;
  saving?: boolean;
  onSave?: () => void;

  onGotoParent?: () => void;

  /**
   * 参与协作的用户
   */
  collaborators?: IUser[];

  /**
   * 多人协作的状态
   */
  collaborationStatus?: CollaborationDescription;

  // 插槽
  right?: React.ReactNode;
}

export const DesignerHeader = observer(function DesignerHeader(props: DesignerHeaderProps) {
  const {
    name,
    onSave,
    onGotoParent,
    saving,
    version,
    title,
    readonly,
    collaborators,
    collaborationStatus,
    saveTooltip,
    versionStatus,
    right,
  } = props;
  const router = useRouter();

  const save = (
    <Button type="primary" size="small" loading={saving} onClick={onSave}>
      保存
    </Button>
  );

  const backHome = () => {
    router.push('/dashboard');
  };

  const hasVersion = version != null && versionStatus != null;

  return (
    <div className={s.root}>
      <div className={s.back} onClick={backHome} title="返回主页">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.svg" alt="logo" />
      </div>
      <div className={s.aside}>
        <span className={s.title}>
          {!!name && (
            <>
              <span className={s.name} onClick={onGotoParent}>
                {name}
              </span>
              <span className={s.split}>/</span>
            </>
          )}
          <span className={s.mainTitle}>{title}</span>
        </span>
        {!!hasVersion && <VersionBadge className={s.version} version={version} status={versionStatus} />}
      </div>
      <div className={s.center}></div>
      <div className={s.aside}>
        <Space split={<Divider type="vertical" />} size="small">
          {right}

          {!readonly && (
            <div className={s.collab}>
              {/* 协作状态 */}
              {!!collaborators?.length && (
                <Avatar.Group maxCount={7} className={s.collaborators}>
                  {collaborators.map(i => {
                    return (
                      <Tooltip title={i.name} key={i.id} placement="bottomRight">
                        <Avatar size="small" src={i.avatar}>
                          {i.name}
                        </Avatar>
                      </Tooltip>
                    );
                  })}
                </Avatar.Group>
              )}
              {!!collaborationStatus && <CollabStatus status={collaborationStatus} />}
            </div>
          )}

          <div className={s.save}>
            {/* 历史记录 */}
            {!readonly && (
              <HistoryViewModal>
                <HistoryOutlined className={s.history} title="历史记录" />
              </HistoryViewModal>
            )}

            {/* 保存按钮 */}
            {!readonly ? (
              saveTooltip ? (
                <Tooltip title={saveTooltip} placement="bottomRight">
                  {save}
                </Tooltip>
              ) : (
                save
              )
            ) : (
              <Button disabled>只读</Button>
            )}
          </div>
        </Space>
      </div>
    </div>
  );
});
