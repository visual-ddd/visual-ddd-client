import classNames from 'classnames';
import { observer } from 'mobx-react';

import { EnumDSL } from '../../dsl';
import { reactifyEnumMember } from '../../reactify';
import { ClassShapeBase, ClassShapeCells, ClassShapePropertyBase } from '../ClassShape';

import s from './index.module.scss';

export interface EnumShapeProps {
  dsl: EnumDSL;
  style?: React.CSSProperties;
  className?: string;
}

export const EnumShape = observer(function EnumShape(props: EnumShapeProps) {
  const { dsl, style, className } = props;
  return (
    <ClassShapeBase
      className={classNames('vd-shape-enum', s.root, className)}
      style={style}
      type="枚举"
      title={dsl.title}
      name={dsl.name}
    >
      {!!dsl.members.length && (
        <ClassShapeCells>
          {dsl.members.map(i => {
            return (
              <ClassShapePropertyBase
                key={i.uuid}
                name={reactifyEnumMember(i)}
                comment={i.description}
              ></ClassShapePropertyBase>
            );
          })}
        </ClassShapeCells>
      )}
    </ClassShapeBase>
  );
});
