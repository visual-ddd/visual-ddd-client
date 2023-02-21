import { defineShape, ShapeComponentProps, useHoverShowPorts } from '@/lib/editor';
import { ReactComponentBinding, ReactComponentProps, registerReactComponent } from '@/lib/g6-binding';

import { ScenarioObjectName } from '../../dsl';
import s from './index.module.scss';
import icon from './decision.png';
import { PORTS } from '../shared';

const DecisionReactShapeComponent = (props: ReactComponentProps) => {
  return <div className={s.root}></div>;
};

const DecisionShapeComponent = (props: ShapeComponentProps) => {
  const hoverHandlers = useHoverShowPorts();
  return <ReactComponentBinding {...props.cellProps} component={ScenarioObjectName.Decision} {...hoverHandlers} />;
};

registerReactComponent(ScenarioObjectName.Decision, DecisionReactShapeComponent);

defineShape({
  name: ScenarioObjectName.Decision,
  icon,
  title: '决策',
  description: '决策节点',
  shapeType: 'node',
  group: false,
  allowLoopConnect: false,
  allowConnectNodes: [ScenarioObjectName.Activity, ScenarioObjectName.Decision, ScenarioObjectName.End],
  edgeFactory: ScenarioObjectName.LabelEdge,

  initialProps: () => {
    return {};
  },

  staticProps: () => ({
    zIndex: 2,
    ...PORTS,
  }),

  component: DecisionShapeComponent,
});
