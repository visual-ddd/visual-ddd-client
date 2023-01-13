import classNames from 'classnames';
import { observer } from 'mobx-react';
import { DataObjectPropertyDSL } from '../../dsl';

import s from './RequireRenderer.module.scss';

export interface RequireRendererProps {
  property: DataObjectPropertyDSL;
}

export const RequireRenderer = observer(function RequireRenderer(props: RequireRendererProps) {
  const { property } = props;
  const required = !!property.notNull || property.primaryKey;

  if (required) {
    return <span className={classNames('vd-data-property__required', s.root)}>*</span>;
  }

  return null;
});
