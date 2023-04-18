import { BaseNode, useEditorModel, usePropertyLocationNavigate } from '@/lib/editor';
import { ClassShapeBase, ClassShapeCells, ClassShapePropertyBase } from '@/modules/domain/domain-design/dsl';
import classNames from 'classnames';
import { observer } from 'mobx-react';

import { MapperObjectDSL } from '../../dsl';
import { MapperEditorModel } from '../../model';
import { ObjectMapperDisplay } from './ObjectMapperDisplay';
import { reactifyMapper } from './reactify';

import s from './Shape.module.scss';

export interface MapperShapeProps {
  dsl: MapperObjectDSL;
  model: BaseNode;
}

export const MapperShape = observer(function MapperShape(props: MapperShapeProps) {
  const { model, dsl } = props;
  const { model: editorModel } = useEditorModel<MapperEditorModel>();
  const mapper = editorModel.mapperStore.getMapperById(model.id);
  const open = usePropertyLocationNavigate();

  const handleMemberClick = (index: number) => (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();

    open({ nodeId: dsl.uuid, path: `mappers[${index}]` });
  };

  if (mapper == null) {
    return null;
  }

  return (
    <ClassShapeBase
      className={classNames('vd-shape-mapper', s.root)}
      type="对象映射"
      showName={false}
      header={
        <>
          <div className={classNames('u-bold u-tc', s.name)}>{mapper.readableTitle}</div>
          <div>
            <ObjectMapperDisplay mapper={mapper} />
          </div>
        </>
      }
    >
      {mapper.mappers.length > 0 && (
        <ClassShapeCells>
          {mapper.mappers.map((i, index) => {
            return (
              <ClassShapePropertyBase
                className={s.property}
                key={i.uuid}
                name={reactifyMapper(i.source, i.target, mapper)}
                onDoubleClick={handleMemberClick(index)}
              ></ClassShapePropertyBase>
            );
          })}
        </ClassShapeCells>
      )}
    </ClassShapeBase>
  );
});
