import { defineShape, FormRuleReportType, ROOT_FIELD, ShapeComponentProps, useShapeModel } from '@/lib/editor';
import { ReactComponentBinding, ReactComponentProps, registerReactComponent } from '@/lib/g6-binding';
import cronParser from 'cron-parser';
import memoize from 'lodash/memoize';

import {
  CommandDSL,
  createCommand,
  DomainObjectName,
  checkUnderPackage,
  checkSameAggregationReference,
  checkPropertyName,
  SourceDSL,
  checkReferenceError,
  checkAggregationRootReference,
  checkDomainObjectNameConflict,
  checkCommandCategoryConflict,
} from '../../dsl';
import { createCopyAsMenu } from '@/modules/domain/transform';

import { CommandShape } from './CommandShape';
import { CommandEditor } from './CommandEditor';

import icon from './command.png';

const CommandReactShapeComponent = (props: ReactComponentProps) => {
  const properties = useShapeModel<CommandDSL>(props.node).properties;

  if (properties == null) {
    return null;
  }

  return <CommandShape dsl={properties} />;
};

registerReactComponent(DomainObjectName.Command, CommandReactShapeComponent);

const CommandShapeComponent = (props: ShapeComponentProps) => {
  return <ReactComponentBinding {...props.cellProps} component={DomainObjectName.Command} />;
};

const CommandAttributeComponent = () => {
  return <CommandEditor />;
};

const validateCron = memoize((value: string) => {
  try {
    cronParser.parseExpression(value, {});
  } catch (err) {
    throw new Error(`Cron 表达式不正确: ${(err as Error).message}`);
  }
});

/**
 * 实体
 */
defineShape({
  name: DomainObjectName.Command,
  title: '命令',
  description: '命令',
  icon: icon,
  shapeType: 'node',
  rules: {
    fields: {
      [ROOT_FIELD]: {
        $self: [
          {
            // 检查是否在聚合下
            async validator(value, context) {
              checkUnderPackage(context);
            },
            reportType: FormRuleReportType.Warning,
          },
          {
            // 检查引用
            async validator(value, context) {
              checkSameAggregationReference(context);
              checkReferenceError(context);
              checkAggregationRootReference(context);
            },
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
      source: {
        $self: {
          async validator(value) {
            const v = value as SourceDSL;

            if (v.event.enabled) {
              if (!v.event.value) {
                throw new Error('事件名称不能为空');
              }
            }

            if (v.schedule.enabled) {
              if (!v.schedule.value) {
                throw new Error('Cron 表达式不能为空');
              }

              validateCron(v.schedule.value);
            }
          },
        },
      },
      category: {
        $self: {
          reportType: FormRuleReportType.Warning,
          async validator(value, context) {
            // 命令的分类在同一个聚合下建议唯一
            checkCommandCategoryConflict(value, context);
          },
        },
      },
      properties: {
        $self: { type: 'array' },
        '*': {
          $self: { type: 'object' },
          fields: {
            name: {
              $self: [
                { required: true, message: '属性名不能为空' },
                {
                  async validator(value, context) {
                    checkPropertyName(value, 'properties', context);
                  },
                },
              ],
            },
          },
        },
      },
      eventProperties: {
        $self: { type: 'array' },
        '*': {
          $self: { type: 'object' },
          fields: {
            name: {
              $self: [
                { required: true, message: '属性名不能为空' },
                {
                  async validator(value, context) {
                    checkPropertyName(value, 'eventProperties', context);
                  },
                },
              ],
            },
          },
        },
      },
    },
  },

  contextMenu: [createCopyAsMenu(DomainObjectName.Command)],

  initialProps: () => {
    return { ...createCommand(), zIndex: 2 };
  },
  copyFactory({ payload }) {
    return { uuid: payload.id };
  },
  component: CommandShapeComponent,
  attributeComponent: CommandAttributeComponent,
});
