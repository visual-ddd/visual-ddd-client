import { defineShape, ShapeComponentProps } from '@/lib/editor';
import { ReactComponentBinding, ReactComponentProps, registerReactComponent } from '@/lib/g6-binding';
import { ScenarioObjectName } from '../../dsl';

const StartReactShapeComponent = (props: ReactComponentProps) => {
  return <div style={{ background: 'red', width: 100, height: 100 }}></div>;
};

const StartShapeComponent = (props: ShapeComponentProps) => {
  return <ReactComponentBinding {...props.cellProps} component={ScenarioObjectName.Start} />;
};

registerReactComponent(ScenarioObjectName.Start, StartReactShapeComponent);

defineShape({
  name: ScenarioObjectName.Start,
  title: '起始',
  description: '起始节点',
  shapeType: 'node',
  group: false,

  initialProps: () => {
    return {
      zIndex: 1,
    };
  },
  component: StartShapeComponent,
});
