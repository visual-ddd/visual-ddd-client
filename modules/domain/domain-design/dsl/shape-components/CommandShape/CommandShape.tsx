import { FC } from 'react';
import { observer } from 'mobx-react';
import classNames from 'classnames';
import { usePropertyLocationNavigate } from '@/lib/editor';
import { NoopArray } from '@wakeapp/utils';

import { CommandDSL } from '../../dsl';
import { ClassShapeBase, ClassShapeBaseProps } from '../ClassShape';

import s from './CommandShape.module.scss';

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
  const open = usePropertyLocationNavigate();

  const handleCommandPropertyNavigate: ClassShapeBaseProps['onPropertyFocus'] = evt => {
    const { item } = evt;
    const list = dsl.properties ?? NoopArray;
    const index = list.findIndex(p => p.uuid === item.uuid);
    if (index !== -1) {
      open({ nodeId: dsl.uuid, path: `properties[${index}]` });
    }
  };

  const handleEventPropertyNavigate: ClassShapeBaseProps['onPropertyFocus'] = evt => {
    const { item } = evt;
    const list = dsl.eventProperties ?? NoopArray;
    const index = list.findIndex(p => p.uuid === item.uuid);
    if (index !== -1) {
      open({ nodeId: dsl.uuid, path: `eventProperties[${index}]` });
    }
  };

  return (
    <div className={classNames('vd-shape-command', s.root, className)} {...other}>
      <ClassShapeBase
        type="命令"
        name={dsl.name}
        title={dsl.title}
        properties={dsl.properties}
        onPropertyFocus={handleCommandPropertyNavigate}
        style={COMMAND_STYLE}
      ></ClassShapeBase>
      <ClassShapeBase
        type="事件"
        showName={false}
        properties={dsl.eventProperties}
        style={EVENT_STYLE}
        onPropertyFocus={handleEventPropertyNavigate}
      ></ClassShapeBase>
    </div>
  );
});
