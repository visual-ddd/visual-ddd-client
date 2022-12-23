import { FC } from 'react';
import { ReactComponentProps } from '@/lib/g6-binding';

import classNames from 'classnames';
import { useShapeModel } from '@/lib/editor';

import { EntityDSL, PropertyDSL, MethodDSL, stringifyProperty, stringifyMethod } from '../../dsl';
import s from './ReactShapeComponent.module.scss';
import { observer } from 'mobx-react';

/**
 * 属性渲染
 */
const Property = observer(function Property(props: { value: PropertyDSL }) {
  const { value } = props;
  const { title, description } = value;

  return (
    <div className={classNames('shape-class-property', s.property)}>
      <span className={classNames('shape-class-property__name', s.propertyName)} title={title}>
        {stringifyProperty(value)}
      </span>
      <span className={classNames('shape-class-property__comment', s.propertyComment)} title={description}>
        {description}
      </span>
    </div>
  );
});

/**
 * 方法渲染
 */
const Method = observer(function Method(props: { value: MethodDSL }) {
  const { value } = props;
  const { title, abstract, description } = value;

  return (
    <div className={classNames('shape-class-method', s.method, { abstract })}>
      <span className={classNames('shape-class-method__name', s.methodName)} title={title}>
        {stringifyMethod(value)}
      </span>
      <span className={classNames('shape-class-method__comment', s.methodComment)} title={description}>
        {description}
      </span>
    </div>
  );
});

export const EntityReactShapeComponent: FC<ReactComponentProps> = props => {
  const properties = useShapeModel(props.node).properties as unknown as EntityDSL;

  return (
    <div className={classNames('shape-entity', s.root)}>
      <div className={classNames('shape-entity__header', s.header)}>
        <div className={classNames('shape-entity__type', s.type)}>《实体》</div>
        <div className={classNames('shape-entity__name', s.name)}>{properties.name || 'Untitled'}</div>
        <div className={classNames('shape-entity__title', s.title)}>{properties.title || '未命名'}</div>
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
