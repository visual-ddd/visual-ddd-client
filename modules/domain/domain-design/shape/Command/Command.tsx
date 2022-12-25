import { defineShape, ShapeComponentProps, useShapeModel } from '@/lib/editor';
import { ReactComponentBinding, ReactComponentProps, registerReactComponent } from '@/lib/g6-binding';

import { CommandDSL, CommandShape, createCommand, DomainObjectName, CommandEditor } from '../../dsl';

import icon from './command.png';

const CommandReactShapeComponent = (props: ReactComponentProps) => {
  const properties = useShapeModel(props.node).properties as unknown as CommandDSL;

  return <CommandShape dsl={properties} />;
};

registerReactComponent(DomainObjectName.Command, CommandReactShapeComponent);

const CommandShapeComponent = (props: ShapeComponentProps) => {
  return <ReactComponentBinding {...props.cellProps} component={DomainObjectName.Command} />;
};

const CommandAttributeComponent = () => {
  return <CommandEditor />;
};

/**
 * 实体
 */
defineShape({
  name: DomainObjectName.Command,
  title: '命令',
  description: '命令',
  icon: icon,
  shapeType: 'node',

  initialProps: () => {
    return { ...createCommand(), zIndex: 2 };
  },
  component: CommandShapeComponent,
  attributeComponent: CommandAttributeComponent,
});
