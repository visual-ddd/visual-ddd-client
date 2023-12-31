import { defineShape, ShapeComponentProps, useShapeModel } from '@/lib/editor';
import { ReactComponentBinding, ReactComponentProps, registerReactComponent } from '@/lib/g6-binding';
import { createLanesDSL, LanesDSL, ScenarioObjectName } from '../../dsl';
import { LaneShape } from './LaneShape';

const LaneReactShapeComponent = (props: ReactComponentProps) => {
  const { graph, node } = props;
  const { formModel, properties, editorModel } = useShapeModel<LanesDSL>(props.node);

  if (formModel == null || properties == null) {
    return null;
  }

  return <LaneShape dsl={properties} formModel={formModel} graph={graph} node={node} editorModel={editorModel} />;
};

const LaneShapeComponent = (props: ShapeComponentProps) => {
  return <ReactComponentBinding {...props.cellProps} component={ScenarioObjectName.Lane} />;
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

  /**
   * 不允许选择
   */
  selectable: false,

  /**
   * 不允许复制
   */
  copyable: false,

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
      ...createLanesDSL(),
    };
  },
  staticProps: () => {
    return {
      zIndex: 0,
      // 支持在泳道中进行框选
      attrs: { fo: { style: { pointerEvents: 'none' } } },
    };
  },
  component: LaneShapeComponent,
});
