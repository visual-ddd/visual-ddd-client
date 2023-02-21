import { defineShape, ShapeComponentProps } from '@/lib/editor';
import { ReactComponentBinding, ReactComponentProps, registerReactComponent } from '@/lib/g6-binding';

import { ScenarioObjectName } from '../../dsl';
import s from './index.module.scss';

const ActivityReactShapeComponent = (props: ReactComponentProps) => {
  return <div className={s.root}></div>;
};

const ActivityShapeComponent = (props: ShapeComponentProps) => {
  return <ReactComponentBinding {...props.cellProps} component={ScenarioObjectName.Activity} />;
};

registerReactComponent(ScenarioObjectName.Activity, ActivityReactShapeComponent);

defineShape({
  name: ScenarioObjectName.Activity,
  title: '活动',
  description: '活动节点',
  shapeType: 'node',
  group: false,

  initialProps: () => {
    return {
      zIndex: 1,
    };
  },
  component: ActivityShapeComponent,
});
