import { defineShape, ShapeComponentProps, useHoverShowPorts } from '@/lib/editor';
import { ReactComponentBinding, ReactComponentProps, registerReactComponent } from '@/lib/g6-binding';

import { ScenarioObjectName } from '../../dsl';
import { PORTS } from '../shared';
import s from './index.module.scss';

const ActivityReactShapeComponent = (props: ReactComponentProps) => {
  return <div className={s.root}></div>;
};

const ActivityShapeComponent = (props: ShapeComponentProps) => {
  const handlers = useHoverShowPorts();

  return <ReactComponentBinding {...props.cellProps} component={ScenarioObjectName.Activity} {...handlers} />;
};

registerReactComponent(ScenarioObjectName.Activity, ActivityReactShapeComponent);

defineShape({
  name: ScenarioObjectName.Activity,
  title: '活动',
  description: '活动节点',
  shapeType: 'node',
  group: false,
  allowLoopConnect: false,
  allowConnectNodes: [ScenarioObjectName.Activity, ScenarioObjectName.Decision, ScenarioObjectName.End],
  edgeFactory: ScenarioObjectName.NormalEdge,

  initialProps: () => {
    return {};
  },
  staticProps: () => ({
    zIndex: 2,
    ...PORTS,
  }),
  component: ActivityShapeComponent,
});
