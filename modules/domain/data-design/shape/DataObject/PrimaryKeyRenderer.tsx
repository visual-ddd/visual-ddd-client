import { useEditorModel } from '@/lib/editor';
import classNames from 'classnames';
import { observer } from 'mobx-react';
import Icon from '@ant-design/icons';

import { DataObjectDSL, DataObjectPropertyDSL } from '../../dsl';
import { DataObjectEditorModel } from '../../model';

import s from './PrimaryKeyRenderer.module.scss';
import { KeyIcon } from './KeyIcon';

export interface PrimaryKeyRendererProps {
  object: DataObjectDSL;
  property: DataObjectPropertyDSL;
}

export const PrimaryKeyRenderer = observer(function PrimaryKeyRenderer(props: PrimaryKeyRendererProps) {
  const { model } = useEditorModel<DataObjectEditorModel>();
  const { property, object } = props;
  const isPrimary = property.primaryKey;
  const dataObject = model.dataObjectStore.getObjectById(object.uuid);

  if (!isPrimary) {
    return null;
  }

  const index = (dataObject?.getPrimaryKeyIndex(property.uuid) ?? 0) + 1;

  return (
    <div className={classNames('vd-pk', s.root)}>
      <Icon>
        <KeyIcon />
      </Icon>
      <span className={classNames('vd-pk__index', s.index)}>{index}</span>
    </div>
  );
});
