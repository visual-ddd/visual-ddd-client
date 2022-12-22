import { FC, memo } from 'react';
import { ReactComponentProps } from '@/lib/g6-binding';

import classNames from 'classnames';
import { useShapeModel } from '@/lib/editor';

import { EntityDSL, PropertyDSL, UntitledInCamelCase, VoidClass, AccessModifier, MethodDSL, Void } from '../../dsl';
import s from './ReactShapeComponent.module.scss';

/**
 * 属性渲染
 */
const Property = memo((props: { value: PropertyDSL }) => {
  const { value } = props;
  const { access = 'public', type = VoidClass, title, name = UntitledInCamelCase, description } = value;

  return (
    <div className={classNames('shape-class-property', s.property)}>
      <span className={classNames('shape-class-property__access', s.propertyAccess)}>{AccessModifier[access]}</span>
      <span className={classNames('shape-class-property__name', s.propertyName)} title={title}>
        <span className="u-bold">{name}</span>: {type}
      </span>
      <span className={classNames('shape-class-property__comment', s.propertyComment)} title={description}>
        {description}
      </span>
    </div>
  );
});

Property.displayName = 'Property';

/**
 * 方法渲染
 */
const Method = memo((props: { value: MethodDSL }) => {
  const { value } = props;
  const {
    access = 'public',
    result = Void,
    parameters = [],
    title,
    abstract,
    name = UntitledInCamelCase,
    description,
  } = value;

  return (
    <div className={classNames('shape-class-method', s.method, { abstract })}>
      <span className={classNames('shape-class-method__access', s.methodAccess)}>{AccessModifier[access]}</span>
      <span className={classNames('shape-class-method__name', s.methodName)} title={title}>
        <span className="u-bold">{name}</span>(
        {parameters
          .map(p => {
            return `${p.name ?? UntitledInCamelCase}: ${p.type ?? VoidClass}`;
          })
          .join(', ')}
        ): {result}
      </span>
      <span className={classNames('shape-class-method__comment', s.methodComment)} title={description}>
        {description}
      </span>
    </div>
  );
});

Method.displayName = 'Method';

export const EntityReactShapeComponent: FC<ReactComponentProps> = props => {
  const properties = useShapeModel(props.node).properties as unknown as EntityDSL;

  return (
    <div className={classNames('shape-entity', s.root)}>
      <div className={classNames('shape-entity__header', s.header)}>
        <div className={classNames('shape-entity__type', s.type)}>《实体》</div>
        <div className={classNames('shape-entity__name', s.name)}>{properties.name ?? 'Untitled'}</div>
        <div className={classNames('shape-entity__title', s.title)}>{properties.title ?? '未命名'}</div>
      </div>
      <div className={classNames('shape-entity__cells', s.cells)}>
        {properties.properties.map(i => {
          return <Property key={i.uuid} value={i}></Property>;
        })}
      </div>
      {!!properties.methods.length && (
        <div className={classNames('shape-entity__cells', s.cells)}>
          {properties.methods.map(i => {
            return <Method key={i.uuid} value={i}></Method>;
          })}
        </div>
      )}
    </div>
  );
};
