import {
  defineShape,
  EditorFormContainer,
  EditorFormItem,
  ShapeComponentProps,
  useHoverShowPorts,
  useShapeModel,
} from '@/lib/editor';
import { ReactComponentBinding, ReactComponentProps, registerReactComponent } from '@/lib/g6-binding';

import { createDecisionDSL, DecisionDSL, ScenarioObjectName } from '../../dsl';
import s from './index.module.scss';
import icon from './decision.png';
import { PORTS } from '../shared';
import { TitleInput } from '@/lib/components/TitleInput';

const DecisionReactShapeComponent = (props: ReactComponentProps) => {
  const { properties } = useShapeModel<DecisionDSL>(props.node);

  if (properties == null) {
    return null;
  }

  return (
    <div className={s.root}>
      <span className={s.name}>{properties.title || '决策'}</span>
    </div>
  );
};

const DecisionShapeComponent = (props: ShapeComponentProps) => {
  const hoverHandlers = useHoverShowPorts();
  return <ReactComponentBinding {...props.cellProps} component={ScenarioObjectName.Decision} {...hoverHandlers} />;
};

const DecisionEditor = () => {
  return (
    <EditorFormContainer>
      <EditorFormItem path="title" label="标题">
        <TitleInput />
      </EditorFormItem>
    </EditorFormContainer>
  );
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
  allowDuplicatedConnect: 'none',
  edgeFactory: ScenarioObjectName.LabelEdge,

  initialProps: () => {
    return {
      ...createDecisionDSL(),
    };
  },

  staticProps: () => ({
    zIndex: 2,
    ...PORTS,
  }),

  component: DecisionShapeComponent,
  attributeComponent: DecisionEditor,
});
