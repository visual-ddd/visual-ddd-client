import { InboxOutlined } from '@ant-design/icons';
import { observer } from 'mobx-react';

import { ActivityDSL } from '../../dsl';
import s from './ActivityShape.module.scss';

export interface ActivityShapeProps {
  dsl: ActivityDSL;
}

export const ActivityShape = observer(function ActivityShape(props: ActivityShapeProps) {
  const { dsl } = props;

  return (
    <div className={s.root}>
      <div className={s.icon}>
        <InboxOutlined />
      </div>
      <div className={s.content}>{dsl.title || '业务活动'}</div>
    </div>
  );
});
