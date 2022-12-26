import { FC } from 'react';
import { observer } from 'mobx-react';
import classNames from 'classnames';

import { CommandDSL } from '../../dsl';

import s from './CommandShape.module.scss';
import { ClassShapeBase } from '../ClassShape';

export interface CommandShapeProps {
  dsl: CommandDSL;
  style?: React.CSSProperties;
  className?: string;
}

const COMMAND_STYLE: React.CSSProperties = {
  background: '#FFFFB8',
};

const EVENT_STYLE: React.CSSProperties = {
  background: '#FFF1F0',
};

export const CommandShape: FC<CommandShapeProps> = observer(function CommandShape(props) {
  const { dsl, className, ...other } = props;
  return (
    <div className={classNames('vd-shape-command', s.root, className)} {...other}>
      <ClassShapeBase
        type="命令"
        name={dsl.name}
        title={dsl.title}
        properties={dsl.properties}
        style={COMMAND_STYLE}
      ></ClassShapeBase>
      <ClassShapeBase
        type="事件"
        showName={false}
        properties={dsl.eventProperties}
        style={EVENT_STYLE}
      ></ClassShapeBase>
    </div>
  );
});
