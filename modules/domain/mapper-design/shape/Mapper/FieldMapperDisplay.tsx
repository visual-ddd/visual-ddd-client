import { NameDSL } from '@/modules/domain/domain-design/dsl';
import { ArrowRightOutlined } from '@ant-design/icons';
import classNames from 'classnames';
import { observer } from 'mobx-react';
import React from 'react';

import { Mapper } from '../../model';

import s from './FieldMapperDisplay.module.scss';

const stringifyField = (id: string | undefined, field: NameDSL | undefined) => {
  return (id ? field?.name : <span className="u-danger">未选择</span>) || <span className="u-danger">未定义</span>;
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
      {stringifyField(sourceFieldId, sourceField)}
      <ArrowRightOutlined />
      {stringifyField(targetFieldId, targetField)}
    </span>
  );
});
