import { defineShape, ShapeComponentProps, useShapeModel } from '@/lib/editor';
import { ReactComponentBinding, ReactComponentProps, registerReactComponent } from '@/lib/g6-binding';
import { createLanesDSL, LanesDSL, ScenarioObjectName } from '../../dsl';
import { LaneShape } from './Shape';

const LaneReactShapeComponent = (props: ReactComponentProps) => {
  const { graph, node } = props;
  const { formModel, properties, editorModel } = useShapeModel(props.node);

  return (
    <LaneShape
      dsl={properties as unknown as LanesDSL}
      formModel={formModel}
      graph={graph}
      node={node}
      editorModel={editorModel}
    />
  );
};

const LaneShapeComponent = (props: ShapeComponentProps) => {
  return (
    <ReactComponentBinding
      {...props.cellProps}
      // 支持在泳道中进行框选
      attrs={{ fo: { style: { pointerEvents: 'none' } } }}
      component={ScenarioObjectName.Lane}
    />
  );
};

registerReactComponent(ScenarioObjectName.Lane, LaneReactShapeComponent);

defineShape({
  name: ScenarioObjectName.Lane,
  title: '泳道',
  description: '泳道',
  shapeType: 'node',
  group: true,
  embeddable: true,
  droppable: true,
  selectable: false,

  /**
   * 不允许删除
   */
  removable: false,

  /**
   * 不允许移动
   * @returns
   */
  movable: false,

  initialProps: () => {
    return {
      zIndex: 0,

      ...createLanesDSL(),
    };
  },
  component: LaneShapeComponent,
});
