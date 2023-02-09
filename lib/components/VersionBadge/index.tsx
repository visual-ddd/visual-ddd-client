import classNames from 'classnames';
import s from './index.module.scss';

export interface VersionBadgeProps {
  version: React.ReactNode;
  status?: React.ReactNode;
}

export const VersionBadge = (props: VersionBadgeProps) => {
  const { version, status } = props;
  return (
    <div className={classNames('vd-version-badge', s.root)}>
      <span className={classNames('vd-version-badge__version', s.version)}>{version}</span>
      {!!status && <span className={classNames('vd-version-badge__status', s.status)}>{status}</span>}
    </div>
  );
};
