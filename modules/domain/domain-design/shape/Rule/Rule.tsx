import { defineShape, ShapeComponentProps, useShapeModel } from '@/lib/editor';
import { ReactComponentBinding, ReactComponentProps, registerReactComponent } from '@/lib/g6-binding';

import { RuleShape, RuleEditor, DomainObjectName, createRule, RuleDSL } from '../../dsl';

import icon from './rule.png';

const RuleReactShapeComponent = (props: ReactComponentProps) => {
  const properties = useShapeModel(props.node).properties as unknown as RuleDSL;

  return <RuleShape dsl={properties} />;
};

registerReactComponent(DomainObjectName.Rule, RuleReactShapeComponent);

const RuleShapeComponent = (props: ShapeComponentProps) => {
  return <ReactComponentBinding {...props.cellProps} component={DomainObjectName.Rule} />;
};

const RuleAttributesComponent = () => {
  return <RuleEditor />;
};

/**
 * 规则
 */
defineShape({
  name: DomainObjectName.Rule,
  title: '规则',
  description: '业务规则描述',
  icon: icon,
  shapeType: 'node',

  initialProps: () => {
    return { ...createRule(), zIndex: 2 };
  },
  component: RuleShapeComponent,
  attributeComponent: RuleAttributesComponent,
});
