import { UntitledInCamelCase } from '@/modules/domain/domain-design/dsl';
import classNames from 'classnames';

import {
  DataObjectDSL,
  DataObjectIndexDSL,
  DataObjectIndexTypeName,
  DataObjectPropertyDSL,
  DataObjectTypeDSL,
} from '../../dsl';

import { PrimaryKeyRenderer } from './PrimaryKeyRenderer';
import { TypeRenderer } from './TypeRenderer';
import s from './reactify.module.scss';

export function reactifyType(type: DataObjectTypeDSL) {
  return <TypeRenderer type={type}></TypeRenderer>;
}

export function reactifyProperty(object: DataObjectDSL, property: DataObjectPropertyDSL) {
  return (
    <div className={classNames('vd-data-property', s.root)}>
      <PrimaryKeyRenderer object={object} property={property} />
      <span>
        {property.name || UntitledInCamelCase}: {reactifyType(property.type)}
      </span>
    </div>
  );
}

export function reactifyIndex(object: DataObjectDSL, index: DataObjectIndexDSL) {
  return (
    <>
      {index.name || UntitledInCamelCase}: <b>{DataObjectIndexTypeName[index.type]}</b>
    </>
  );
}
