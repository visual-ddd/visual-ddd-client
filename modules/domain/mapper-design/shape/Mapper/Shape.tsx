import { BaseNode, useEditorModel } from '@/lib/editor';
import {
  ClassShapeBase,
  ClassShapeCells,
  ClassShapePropertyBase,
  UntitledInCamelCase,
} from '@/modules/domain/domain-design/dsl';
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
  const { dsl, model } = props;
  const { model: editorModel } = useEditorModel<MapperEditorModel>();
  const mapper = editorModel.mapperStore.getMapperById(model.id)!;

  return (
    <ClassShapeBase
      className={classNames('vd-shape-mapper', s.root)}
      type="对象映射"
      showName={false}
      header={
        <>
          <div className="u-bold">{`${
            dsl.title ? `${dsl.title}(${dsl.name})` : `${dsl.name || UntitledInCamelCase}`
          }`}</div>
          <div>
            <ObjectMapperDisplay mapper={mapper} />
          </div>
        </>
      }
    >
      {mapper.mappers.length > 0 && (
        <ClassShapeCells>
          {mapper.mappers.map(i => {
            return (
              <ClassShapePropertyBase
                key={i.uuid}
                name={reactifyMapper(i.source, i.target, mapper)}
              ></ClassShapePropertyBase>
            );
          })}
        </ClassShapeCells>
      )}
    </ClassShapeBase>
  );
});
