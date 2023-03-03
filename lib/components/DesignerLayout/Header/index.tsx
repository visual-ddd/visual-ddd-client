import { VersionBadge } from '@/lib/components/VersionBadge';
import { IUser, VersionStatus } from '@/lib/core';
import { LeftOutlined } from '@ant-design/icons';
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

  /**
   * 参与协作的用户
   */
  collaborators?: IUser[];

  // 插槽
  right?: React.ReactNode;
}

export const DesignerHeader = observer(function DesignerHeader(props: DesignerHeaderProps) {
  const { name, onSave, saving, version, title, readonly, collaborators, saveTooltip, versionStatus, right } = props;
  const router = useRouter();

  const save = (
    <Button type="primary" size="small" loading={saving} onClick={onSave}>
      保存
    </Button>
  );

  return (
    <div className={s.root}>
      <div className={s.back} onClick={router.back} title="返回上一级">
        <LeftOutlined />
      </div>
      <div className={s.aside}>
        {version != null && versionStatus != null && <VersionBadge version={version} status={versionStatus} />}
      </div>
      <div className={s.center}>
        <span className={s.title}>
          {!!name && (
            <>
              <span className={s.name}>{name}</span>
              <span className={s.split}>/</span>
            </>
          )}
          {title}
          {!!readonly && <span className="u-gray-500">(只读)</span>}
        </span>
      </div>
      <div className={s.aside}>
        {right}

        {!!collaborators?.length && (
          <Avatar.Group maxCount={7} className={s.collaborators}>
            {collaborators.map(i => {
              return (
                <Tooltip title={i.name} key={i.id} placement="rightBottom">
                  <Avatar size="small" src={i.avatar}>
                    {i.name}
                  </Avatar>
                </Tooltip>
              );
            })}
          </Avatar.Group>
        )}

        {/* 保存按钮 */}
        {!readonly &&
          (saveTooltip ? (
            <Tooltip title={saveTooltip} placement="bottomRight">
              {save}
            </Tooltip>
          ) : (
            save
          ))}
      </div>
    </div>
  );
});
