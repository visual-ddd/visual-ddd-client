import classNames from 'classnames';
import { observer } from 'mobx-react';

import { UntitledInCamelCase, UntitledInHumanReadable } from '@/modules/domain/domain-design/dsl/constants';
import { DataObjectDSL, DataObjectPropertyDSL } from '../../dsl';

import s from './DataObjectShape.module.scss';
import { reactifyProperty } from './reactify';

export interface DataObjectShapeProps {
  dsl: DataObjectDSL;
}

export interface DataObjectPropertyProps {
  dsl: DataObjectDSL;
  property: DataObjectPropertyDSL;
}

export const DataObjectProperty = observer(function DataObjectProperty(props: DataObjectPropertyProps) {
  const { dsl, property } = props;
  return (
    <div className={classNames('vd-data-object-shape__property', s.property)}>
      <span className={classNames('vd-data-object-shape__name', s.name)}>{reactifyProperty(dsl, property)}</span>
      <span className={classNames('vd-data-object-shape__title', s.title)}>{property.title}</span>
    </div>
  );
});

export const DataObjectShape = observer(function DataObjectShape(props: DataObjectShapeProps) {
  const { dsl } = props;

  return (
    <div className={classNames('vd-data-object-shape', s.root)}>
      <header className={classNames('vd-data-object-shape__hd', s.header)}>
        {dsl.title || UntitledInHumanReadable}({dsl.name || UntitledInCamelCase})
      </header>
      <div className={classNames('vd-data-object-shape__bd', s.body)}>
        {dsl.properties.map(property => (
          <DataObjectProperty key={property.uuid} dsl={dsl} property={property}></DataObjectProperty>
        ))}
      </div>
    </div>
  );
});
