import { CollaborationDescription, CollaborationStatus } from '@/lib/designer';
import { observer } from 'mobx-react';
import s from './CollabStatus.module.scss';
import classNames from 'classnames';
import { Tooltip } from 'antd';

export interface CollabStatusProps {
  status: CollaborationDescription;
}

const StatusMap = {
  [CollaborationStatus.Connected]: '已连接',
  [CollaborationStatus.Error]: '连接异常',
  [CollaborationStatus.Offline]: '已离线',
};

export const CollabStatus = observer(function CollabStatus(props: CollabStatusProps) {
  const { status } = props;
  return (
    <Tooltip
      title={
        <div className={s.tooltip}>
          <div className={s.head}>
            <span className={classNames(s.status, status.status)}>{StatusMap[status.status]}</span>
            <span className={s.description}>: {status.description}</span>
          </div>
          <div className={s.tip}>
            <div>Visual DDD 支持多人协作设计</div>
            <div>参与协作的编辑者的头像会显示在左侧</div>
          </div>
        </div>
      }
    >
      <div className={classNames(s.root, status.status)}></div>
    </Tooltip>
  );
});
