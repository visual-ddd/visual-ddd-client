import { InboxOutlined } from '@ant-design/icons';
import classNames from 'classnames';
import { observer } from 'mobx-react';

import { ActivityBindingType, ActivityDSL } from '../../dsl';
import s from './ActivityShape.module.scss';

export interface ActivityShapeProps {
  dsl: ActivityDSL;
}

export const ActivityShape = observer(function ActivityShape(props: ActivityShapeProps) {
  const { dsl } = props;

  const bound =
    dsl.binding?.type &&
    (dsl.binding.type === ActivityBindingType.DomainService ? dsl.binding.domainId : dsl.binding.serviceId);

  return (
    <div className={classNames(s.root, { [s.bound]: bound })}>
      <div className={s.icon}>
        <InboxOutlined />
      </div>
      <div className={s.content}>{dsl.title || '业务活动'}</div>
    </div>
  );
});
