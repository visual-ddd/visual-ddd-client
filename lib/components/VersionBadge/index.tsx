import { VersionStatusColor, VersionStatusMap } from '@/lib/core';
import classNames from 'classnames';
import { VersionStatus } from '../VersionControl/types';
import s from './index.module.scss';

export interface VersionBadgeProps {
  version: React.ReactNode;
  status: VersionStatus;
  /**
   * 展示模式，block 块状, text 文本形式
   * 默认 block
   */
  type?: 'block' | 'text';

  className?: string;
  style?: React.CSSProperties;
}

export const VersionBadge = (props: VersionBadgeProps) => {
  const { version, status, type = 'block', className, style } = props;
  return (
    <div
      className={classNames('vd-version-badge', s.root, type, className)}
      style={{
        ...style,
        // @ts-expect-error
        '--color': VersionStatusColor[status],
      }}
    >
      <span className={classNames('vd-version-badge__version', s.version)}>{version}</span>
      {!!status && <span className={classNames('vd-version-badge__status', s.status)}>{VersionStatusMap[status]}</span>}
    </div>
  );
};
