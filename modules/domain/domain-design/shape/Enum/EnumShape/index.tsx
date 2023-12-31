import { usePropertyLocationNavigate } from '@/lib/editor';
import classNames from 'classnames';
import { observer } from 'mobx-react';

import { EnumDSL } from '../../../dsl/dsl';
import { reactifyEnumMember } from '../../../dsl/reactify';
import { ClassShapeBase, ClassShapeCells, ClassShapePropertyBase } from '../../../dsl/components/ClassShape';

import s from './index.module.scss';

export interface EnumShapeProps {
  dsl: EnumDSL;
  style?: React.CSSProperties;
  className?: string;
}

export const EnumShape = observer(function EnumShape(props: EnumShapeProps) {
  const { dsl, style, className } = props;
  const open = usePropertyLocationNavigate();

  const handleMemberNavigate = (index: number) => (evt: React.MouseEvent<HTMLDivElement>) => {
    evt.preventDefault();
    evt.stopPropagation();

    open({ nodeId: dsl.uuid, path: `members[${index}]` });
  };

  return (
    <ClassShapeBase
      className={classNames('vd-shape-enum', s.root, className)}
      style={style}
      type="枚举"
      title={dsl.title}
      name={`${dsl.name}:${dsl.baseType.toUpperCase()}`}
    >
      {!!dsl.members.length && (
        <ClassShapeCells>
          {dsl.members.map((i, index) => {
            return (
              <ClassShapePropertyBase
                onDoubleClick={handleMemberNavigate(index)}
                key={i.uuid}
                name={reactifyEnumMember(i)}
                comment={i.title}
              ></ClassShapePropertyBase>
            );
          })}
        </ClassShapeCells>
      )}
    </ClassShapeBase>
  );
});
