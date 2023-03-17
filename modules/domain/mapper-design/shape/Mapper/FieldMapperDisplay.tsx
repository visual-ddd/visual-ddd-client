import { DataObjectPropertyDSL } from '@/modules/domain/data-design/dsl';
import { PropertyDSL, stringifyTypeDSL } from '@/modules/domain/domain-design/dsl';
import { SwapOutlined } from '@ant-design/icons';
import classNames from 'classnames';
import { observer } from 'mobx-react';
import React from 'react';

import { Mapper } from '../../model';

import s from './FieldMapperDisplay.module.scss';

const stringifySourceField = (id: string | undefined, field: PropertyDSL | undefined, mapper: Mapper) => {
  if (id == null) {
    return <span className="u-danger">未选择</span>;
  }

  if (field == null) {
    return <span className="u-danger">未定义</span>;
  }

  return (
    <span>
      {field.name}:{' '}
      <span className={s.type}>
        {stringifyTypeDSL(field.type, (id, name) => {
          return mapper.getSourceObjectById(id)?.name ?? name;
        })}
      </span>
    </span>
  );
};

const stringifyTargetField = (id: string | undefined, field: DataObjectPropertyDSL | undefined, mapper: Mapper) => {
  if (id == null) {
    return <span className="u-danger">未选择</span>;
  }

  if (field == null) {
    return <span className="u-danger">未定义</span>;
  }

  return (
    <span>
      {field.name}: <span className={s.type}>{field.type.type}</span>
    </span>
  );
};

export const FieldMapperDisplay = observer(function MapperDisplay(props: {
  sourceFieldId: string | undefined;
  targetFieldId: string | undefined;
  mapper: Mapper;
}) {
  const { sourceFieldId, targetFieldId, mapper } = props;

  const sourceField = mapper.getSourceFieldById(sourceFieldId);
  const targetField = mapper.getTargetFieldById(targetFieldId);

  return (
    <span className={classNames('vd-field-mapper', s.root)}>
      {stringifySourceField(sourceFieldId, sourceField, mapper)}
      <SwapOutlined />
      {stringifyTargetField(targetFieldId, targetField, mapper)}
    </span>
  );
});
