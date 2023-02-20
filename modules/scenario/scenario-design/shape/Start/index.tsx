import { defineShape, ShapeComponentProps } from '@/lib/editor';
import { ReactComponentBinding, ReactComponentProps, registerReactComponent } from '@/lib/g6-binding';

import { ScenarioObjectName } from '../../dsl';
import s from './index.module.scss';
import { TriangleIcon } from './TriangleIcon';
import icon from './start.png';

const StartReactShapeComponent = (props: ReactComponentProps) => {
  return (
    <div className={s.root}>
      <TriangleIcon />
    </div>
  );
};

const StartShapeComponent = (props: ShapeComponentProps) => {
  return <ReactComponentBinding {...props.cellProps} component={ScenarioObjectName.Start} />;
};

registerReactComponent(ScenarioObjectName.Start, StartReactShapeComponent);

defineShape({
  name: ScenarioObjectName.Start,
  icon,
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
