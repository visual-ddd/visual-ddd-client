import { VersionBadge } from '@/lib/components/VersionBadge';
import { IUser, VersionStatus } from '@/lib/core';
import { Avatar, Button, Tooltip } from 'antd';
import { observer } from 'mobx-react';
import { useRouter } from 'next/router';

import s from './index.module.scss';

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
    router.push('/');
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
        {right}

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
    </div>
  );
});
