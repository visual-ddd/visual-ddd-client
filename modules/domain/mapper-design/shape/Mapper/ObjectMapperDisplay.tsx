import { IDDSL, NameDSL } from '@/modules/domain/domain-design/dsl';
import { ObjectReferenceDSL } from '../../dsl';
import { ArrowRightOutlined } from '@ant-design/icons';
import classNames from 'classnames';
import { observer } from 'mobx-react';
import { Mapper } from '../../model';
import s from './ObjectMapperDisplay.module.scss';

const stringifyObject = (id: ObjectReferenceDSL | undefined, object: NameDSL | undefined) => {
  return (id ? object?.name : <span className="u-danger">未选择</span>) || <span className="u-danger">未定义</span>;
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
      <span
        className={classNames('vd-object-mapper__object u-link', s.object)}
        onClick={handleObjectClick(mapper.sourceObject)}
      >
        {stringifyObject(mapper.dsl.source, mapper.sourceObject)}
      </span>
      <ArrowRightOutlined />
      <span
        className={classNames('vd-object-mapper__object u-link', s.object)}
        onClick={handleObjectClick(mapper.targetObject)}
      >
        {stringifyObject(mapper.dsl.target, mapper.targetObject)}
      </span>
    </span>
  );
});
