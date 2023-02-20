import { defineShape, ShapeComponentProps } from '@/lib/editor';
import { ReactComponentBinding, ReactComponentProps, registerReactComponent } from '@/lib/g6-binding';

import { ScenarioObjectName } from '../../dsl';
import s from './index.module.scss';
import icon from './end.png';

const EndReactShapeComponent = (props: ReactComponentProps) => {
  return (
    <div className={s.root}>
      <div className={s.icon}></div>
    </div>
  );
};

const EndShapeComponent = (props: ShapeComponentProps) => {
  return <ReactComponentBinding {...props.cellProps} component={ScenarioObjectName.End} />;
};

registerReactComponent(ScenarioObjectName.End, EndReactShapeComponent);

defineShape({
  name: ScenarioObjectName.End,
  icon,
  title: '结束',
  description: '结束节点',
  shapeType: 'node',
  group: false,

  initialProps: () => {
    return {
      zIndex: 1,
    };
  },
  component: EndShapeComponent,
});
