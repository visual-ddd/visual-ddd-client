import { defineShape, ShapeComponentProps, useHoverShowPorts, useShapeModel } from '@/lib/editor';
import { ReactComponentBinding, ReactComponentProps, registerReactComponent } from '@/lib/g6-binding';

import { ActivityDSL, createActivityDSL, ScenarioObjectName } from '../../dsl';
import { PORTS } from '../shared';
import { ActivityShape } from './ActivityShape';
import icon from './activity.png';
import { ActivityEditor } from './ActivityEditor';

const ActivityReactShapeComponent = (props: ReactComponentProps) => {
  const { properties } = useShapeModel(props.node);

  return <ActivityShape dsl={properties as unknown as ActivityDSL} />;
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
  icon,
  group: false,
  allowLoopConnect: false,
  allowConnectNodes: [ScenarioObjectName.Activity, ScenarioObjectName.Decision, ScenarioObjectName.End],
  allowDuplicatedConnect: 'none',
  edgeFactory: ScenarioObjectName.NormalEdge,

  initialProps: () => {
    return {
      ...createActivityDSL(),
    };
  },

  copyFactory({ initialProperties }) {
    // 拷贝时自动生成新的 name
    return { name: initialProperties.name };
  },

  staticProps: () => ({
    zIndex: 2,
    ...PORTS,
  }),

  component: ActivityShapeComponent,
  attributeComponent: ActivityEditor,
});
