import { UntitledInCamelCase } from '@/modules/domain/domain-design/dsl';
import classNames from 'classnames';

import {
  DataObjectDSL,
  DataObjectIndexDSL,
  DataObjectIndexTypeName,
  DataObjectPropertyDSL,
  DataObjectTypeDSL,
  objectTypeThatSupportPrimaryKey,
} from '../../dsl';

import { PrimaryKeyRenderer } from './PrimaryKeyRenderer';
import { TypeRenderer } from './TypeRenderer';
import s from './reactify.module.scss';
import { RequireRenderer } from './RequireRenderer';

export function reactifyType(type: DataObjectTypeDSL) {
  return <TypeRenderer type={type}></TypeRenderer>;
}

export function reactifyProperty(object: DataObjectDSL, property: DataObjectPropertyDSL) {
  const isSupportPrimaryKey = objectTypeThatSupportPrimaryKey(property.type.type);

  return (
    <div className={classNames('vd-data-property', s.root)}>
      {isSupportPrimaryKey && (
        <>
          <RequireRenderer property={property} />
          <PrimaryKeyRenderer object={object} property={property} />
        </>
      )}
      <span className={classNames('vd-data-property__name', s.name)}>
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
