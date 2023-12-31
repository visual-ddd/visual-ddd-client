import { defineShape, ShapeComponentProps, useHoverShowPorts } from '@/lib/editor';
import { ReactComponentBinding, ReactComponentProps, registerReactComponent } from '@/lib/g6-binding';

import { ScenarioObjectName } from '../../dsl';
import s from './index.module.scss';
import { TriangleIcon } from './TriangleIcon';
import icon from './start.png';
import { PORTS } from '../shared';

const StartReactShapeComponent = (props: ReactComponentProps) => {
  return (
    <div className={s.root}>
      <TriangleIcon />
    </div>
  );
};

const StartShapeComponent = (props: ShapeComponentProps) => {
  const hoverHandlers = useHoverShowPorts();
  return <ReactComponentBinding {...props.cellProps} component={ScenarioObjectName.Start} {...hoverHandlers} />;
};

registerReactComponent(ScenarioObjectName.Start, StartReactShapeComponent);

defineShape({
  name: ScenarioObjectName.Start,
  icon,
  title: '起始',
  description: '起始节点',
  shapeType: 'node',
  group: false,
  allowLoopConnect: false,
  allowConnectNodes: [ScenarioObjectName.Activity, ScenarioObjectName.End, ScenarioObjectName.Decision],
  edgeFactory: ScenarioObjectName.NormalEdge,

  /**
   * 开始节点只允许一条出边
   */
  allowMagnetCreateEdge: ({ graph, cell }) => {
    const outgoingEdges = graph.getOutgoingEdges(cell);
    if (outgoingEdges?.length) {
      return false;
    }

    return true;
  },

  initialProps: () => {
    return {};
  },

  staticProps: () => ({
    zIndex: 2,
    ...PORTS,
  }),

  component: StartShapeComponent,
});
