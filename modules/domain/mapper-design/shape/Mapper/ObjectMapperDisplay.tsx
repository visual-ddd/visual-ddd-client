import { IDDSL, NameDSL } from '@/modules/domain/domain-design/dsl';
import { ObjectReferenceDSL } from '../../dsl';
import { ArrowRightOutlined } from '@ant-design/icons';
import classNames from 'classnames';
import { observer } from 'mobx-react';
import { Mapper } from '../../model';
import s from './ObjectMapperDisplay.module.scss';

const stringifyObject = (id: ObjectReferenceDSL | undefined, object: NameDSL | undefined, mapper: Mapper) => {
  return id ? (
    object == null ? (
      <span className="u-danger">未定义</span>
    ) : (
      <>
        <span className={classNames('u-link', s.name)}>{object.name}</span>:
        <span className={s.modifier}>{mapper.getObjectType(object.uuid)?.label}</span>
      </>
    )
  ) : (
    <span className="u-danger">未选择</span>
  );
};

export interface ObjectMapperDisplayProps {
  mapper: Mapper;
}

export const ObjectMapperDisplay = observer(function ObjectMapperDisplay(props: ObjectMapperDisplayProps) {
  const { mapper } = props;
  const handleObjectClick = (obj?: IDDSL) => () => {
    if (obj) {
      mapper.focusObject(obj.uuid);
    }
  };

  return (
    <span className={classNames('vd-object-mapper', s.root)}>
      <div
        className={classNames('vd-object-mapper__object', s.object)}
        onClick={handleObjectClick(mapper.sourceObject)}
      >
        {stringifyObject(mapper.dsl.source, mapper.sourceObject, mapper)}
      </div>
      <ArrowRightOutlined />
      <div
        className={classNames('vd-object-mapper__object', s.object)}
        onClick={handleObjectClick(mapper.targetObject)}
      >
        {stringifyObject(mapper.dsl.target, mapper.targetObject, mapper)}
      </div>
    </span>
  );
});
