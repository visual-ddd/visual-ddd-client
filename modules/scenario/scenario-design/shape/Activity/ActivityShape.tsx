import { getMappedLighterColor } from '@/lib/utils';
import { InboxOutlined } from '@ant-design/icons';
import classNames from 'classnames';
import { observer } from 'mobx-react';
import { useMemo } from 'react';

import { ActivityBindingType, ActivityDSL } from '../../dsl';
import s from './ActivityShape.module.scss';

export interface ActivityShapeProps {
  dsl: ActivityDSL;
}

export const ActivityShape = observer(function ActivityShape(props: ActivityShapeProps) {
  const { dsl } = props;

  /**
   * 绑定名称
   */
  const boundKey =
    dsl.binding?.type &&
    (dsl.binding.type === ActivityBindingType.DomainService
      ? dsl.binding.domainId
      : dsl.binding.type === ActivityBindingType.ExternalService
      ? 'external'
      : 'service');

  const color = useMemo(() => {
    return getMappedLighterColor(boundKey ?? '');
  }, [boundKey]);

  /**
   * 已绑定
   */
  const bound =
    dsl.binding?.type &&
    (dsl.binding.type === ActivityBindingType.DomainService
      ? dsl.binding.domainId
      : dsl.binding.type === ActivityBindingType.ScenarioService
      ? dsl.binding.serviceId
      : dsl.binding.serviceName);

  return (
    <div
      className={classNames(s.root, { [s.bound]: bound })}
      style={
        // @ts-expect-error
        { '--color': color }
      }
    >
      <div className={s.icon}>
        <InboxOutlined />
      </div>
      <div className={s.content}>{dsl.title || '业务活动'}</div>
    </div>
  );
});
