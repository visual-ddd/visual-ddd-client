import { defineShape, FormRuleReportType, ROOT_FIELD, ShapeComponentProps, useShapeModel } from '@/lib/editor';
import { ReactComponentBinding, ReactComponentProps, registerReactComponent } from '@/lib/g6-binding';

import {
  RuleShape,
  RuleEditor,
  DomainObjectName,
  createRule,
  RuleDSL,
  checkUnderPackage,
  checkDomainObjectNameConflict,
} from '../../dsl';

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
  rules: {
    fields: {
      [ROOT_FIELD]: {
        $self: [
          {
            // 检查是否在聚合下
            async validator(value, context) {
              checkUnderPackage(context, '命令');
            },
            reportType: FormRuleReportType.Warning,
          },
        ],
      },
      name: {
        $self: [
          { required: true, message: '标识符不能为空' },
          {
            async validator(value, context) {
              // 检查命名是否冲突
              checkDomainObjectNameConflict(value, context);
            },
          },
        ],
      },
      title: { $self: [{ required: true, reportType: FormRuleReportType.Warning, message: '请填写标题' }] },
    },
  },

  initialProps: () => {
    return { ...createRule(), zIndex: 2 };
  },
  component: RuleShapeComponent,
  attributeComponent: RuleAttributesComponent,
});
