import classNames from 'classnames';
import { VersionBadge } from '../VersionBadge';
import { VersionStatus } from '../VersionControl/types';
import s from './index.module.scss';

export interface PreviewPageLayoutProps {
  meta?: React.ReactNode;
  stats?: React.ReactNode;
  left?: React.ReactNode;
  right?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export interface PreviewPageSectionProps {
  name?: React.ReactNode;
  children?: React.ReactNode;
}

export interface PreviewPageVersionProps {
  version: string;
  status: VersionStatus;
}

export const PreviewPageSection = (props: PreviewPageSectionProps) => {
  const { name, children } = props;
  return (
    <div className={classNames('vd-pp-section', s.section)}>
      <div className={classNames('vd-pp-section__name', s.sectionName)}>{name}</div>
      {children}
    </div>
  );
};

export const PreviewPageVersion = (props: PreviewPageVersionProps) => {
  const { version, status } = props;
  return (
    <span className={classNames('vd-pp__version', s.version)}>
      当前版本: <VersionBadge version={version} status={status} />
    </span>
  );
};

export const PreviewPageLayout = (props: PreviewPageLayoutProps) => {
  const { meta, stats, left, right, className, children, ...other } = props;
  return (
    <div className={classNames('vd-pp', s.root, className)} {...other}>
      <div className={classNames('vd-pp__meta', s.meta)}>{meta}</div>
      <div className={classNames('vd-pp__stats', s.stats)}>{stats}</div>
      <div className={classNames('vd-pp__detail', s.detail)}>
        <div className={classNames('vd-pp__col', s.col)}>{left}</div>
        <div className={classNames('vd-pp__col', s.col)}>{right}</div>
      </div>
      {children}
    </div>
  );
};
