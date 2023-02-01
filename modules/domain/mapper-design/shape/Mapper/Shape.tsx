import { BaseNode, useEditorModel } from '@/lib/editor';
import {
  ClassShapeBase,
  ClassShapeCells,
  ClassShapePropertyBase,
  NameDSL,
  UntitledInCamelCase,
} from '@/modules/domain/domain-design/dsl';
import { ArrowRightOutlined } from '@ant-design/icons';
import classNames from 'classnames';
import { observer } from 'mobx-react';

import { MapperObjectDSL, ObjectReferenceDSL } from '../../dsl';
import { Mapper, MapperEditorModel } from '../../model';
import { reactifyMapper } from './reactify';

import s from './Shape.module.scss';

export interface MapperShapeProps {
  dsl: MapperObjectDSL;
  model: BaseNode;
}

const stringifyObject = (id: ObjectReferenceDSL | undefined, object: NameDSL | undefined) => {
  return (id ? object?.name : <span className="u-danger">未选择</span>) || <span className="u-danger">未定义</span>;
};

const ObjectMapperDisplay = observer(function ObjectMapperDisplay({ mapper }: { mapper: Mapper }) {
  return (
    <span className={classNames('vd-object-mapper', s.objectMapper)}>
      {stringifyObject(mapper.dsl.source, mapper.sourceObject)}
      <ArrowRightOutlined />
      {stringifyObject(mapper.dsl.target, mapper.targetObject)}
    </span>
  );
});

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
