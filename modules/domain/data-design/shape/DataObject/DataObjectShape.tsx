import classNames from 'classnames';
import { observer } from 'mobx-react';
import { usePropertyLocationNavigate } from '@/lib/editor';
import { UntitledInCamelCase, UntitledInHumanReadable } from '@/modules/domain/domain-design/dsl/constants';

import { DataObjectDSL, DataObjectPropertyDSL } from '../../dsl';

import s from './DataObjectShape.module.scss';
import { reactifyProperty } from './reactify';

export interface DataObjectShapeProps {
  dsl: DataObjectDSL;
}

export interface DataObjectPropertyProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'property'> {
  dsl: DataObjectDSL;
  property: DataObjectPropertyDSL;
}

export const DataObjectProperty = observer(function DataObjectProperty(props: DataObjectPropertyProps) {
  const { dsl, property, className, ...other } = props;
  return (
    <div className={classNames('vd-data-object-shape__property', s.property, className)} {...other}>
      <span className={classNames('vd-data-object-shape__name', s.name)}>{reactifyProperty(dsl, property)}</span>
      <span className={classNames('vd-data-object-shape__title', s.title)} title={property.title}>
        {property.title}
      </span>
    </div>
  );
});

export const DataObjectShape = observer(function DataObjectShape(props: DataObjectShapeProps) {
  const { dsl } = props;
  const open = usePropertyLocationNavigate();

  return (
    <div className={classNames('vd-data-object-shape', s.root)}>
      <header className={classNames('vd-data-object-shape__hd', s.header)}>
        {dsl.title || UntitledInHumanReadable}({dsl.name || UntitledInCamelCase})
      </header>
      <div className={classNames('vd-data-object-shape__bd', s.body)}>
        {dsl.properties.map((property, index) => (
          <DataObjectProperty
            key={property.uuid}
            dsl={dsl}
            property={property}
            onDoubleClick={evt => {
              evt.preventDefault();
              evt.stopPropagation();
              open({
                nodeId: dsl.uuid,
                path: `properties[${index}]`,
              });
            }}
          ></DataObjectProperty>
        ))}
      </div>
    </div>
  );
});
