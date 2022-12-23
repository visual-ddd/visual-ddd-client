import { FC } from 'react';
import { observer } from 'mobx-react';
import classNames from 'classnames';

import { PropertyDSL, MethodDSL, ClassDSL } from '../../dsl';
import { stringifyProperty, stringifyMethod } from '../../stringify';
import { UntitledInHumanReadable, UntitledInUpperCamelCase } from '../../constants';

import s from './ClassShape.module.scss';

/**
 * 属性渲染
 */
export const ClassShapeProperty = observer(function Property(props: { value: PropertyDSL; isClassMember?: boolean }) {
  const { value, isClassMember } = props;
  const { title, description } = value;

  return (
    <div className={classNames('shape-class-property', s.property)}>
      <span
        className={classNames('shape-class-property__name', s.propertyName, { class: isClassMember })}
        title={title}
      >
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
export const ClassShapeMethod = observer(function Method(props: { value: MethodDSL; isClassMember?: boolean }) {
  const { value, isClassMember } = props;
  const { title, abstract, description } = value;

  return (
    <div className={classNames('shape-class-method', s.method)}>
      <span
        className={classNames('shape-class-method__name', s.methodName, { abstract, class: isClassMember })}
        title={title}
      >
        {stringifyMethod(value)}
      </span>
      <span className={classNames('shape-class-method__comment', s.methodComment)} title={description}>
        {description}
      </span>
    </div>
  );
});

export interface ClassShapeProps {
  dsl: ClassDSL;
  type?: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}

export const ClassShape: FC<ClassShapeProps> = observer(function ClassShape(props) {
  const { dsl, type, className, style } = props;
  const hasProperties = !!(dsl.properties.length || dsl.classProperties.length);
  const hasMethods = !!(dsl.methods.length || dsl.classMethods.length);

  return (
    <div className={classNames('shape-class', s.root, className)} style={style}>
      <div className={classNames('shape-class__header', s.header)}>
        {!!type && <div className={classNames('shape-class__type', s.type)}>《{type}》</div>}
        <div className={classNames('shape-class__name', s.name, { abstract: dsl.abstract })}>
          {dsl.name || UntitledInUpperCamelCase}
        </div>
        <div className={classNames('shape-class__title', s.title)}>{dsl.title || UntitledInHumanReadable}</div>
      </div>
      {hasProperties && (
        <div className={classNames('shape-class__cells', s.cells)}>
          {dsl.classProperties.map(i => {
            return <ClassShapeProperty key={i.uuid} value={i} isClassMember></ClassShapeProperty>;
          })}
          {dsl.properties.map(i => {
            return <ClassShapeProperty key={i.uuid} value={i}></ClassShapeProperty>;
          })}
        </div>
      )}
      {hasMethods && (
        <div className={classNames('shape-class__cells', s.cells)}>
          {dsl.classMethods.map(i => {
            return <ClassShapeMethod key={i.uuid} value={i} isClassMember></ClassShapeMethod>;
          })}
          {dsl.methods.map(i => {
            return <ClassShapeMethod key={i.uuid} value={i}></ClassShapeMethod>;
          })}
        </div>
      )}
    </div>
  );
});
