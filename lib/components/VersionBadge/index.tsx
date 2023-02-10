import { VersionStatusColor, VersionStatusMap } from '@/lib/core';
import classNames from 'classnames';
import { VersionStatus } from '../VersionControl/types';
import s from './index.module.scss';

export interface VersionBadgeProps {
  version: React.ReactNode;
  status: VersionStatus;
}

export const VersionBadge = (props: VersionBadgeProps) => {
  const { version, status } = props;
  return (
    <div className={classNames('vd-version-badge', s.root)} style={{ background: VersionStatusColor[status] }}>
      <span className={classNames('vd-version-badge__version', s.version)}>{version}</span>
      {!!status && <span className={classNames('vd-version-badge__status', s.status)}>{VersionStatusMap[status]}</span>}
    </div>
  );
};
