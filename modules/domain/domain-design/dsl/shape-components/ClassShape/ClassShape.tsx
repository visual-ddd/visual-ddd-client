import React, { FC } from 'react';
import { observer } from 'mobx-react';
import classNames from 'classnames';

import { PropertyDSL, MethodDSL, ClassDSL } from '../../dsl';
import { reactifyMethod, reactifyProperty } from '../../reactify';
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
        {reactifyProperty(value)}
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
        {reactifyMethod(value)}
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

export interface ClassShapeBaseProps {
  style?: React.CSSProperties;
  className?: string;

  /**
   * 描述符
   */
  type?: React.ReactNode;

  /**
   * 名称
   */
  name?: React.ReactNode;

  /**
   * 显示名称，默认 true
   */
  showName?: boolean;

  title?: React.ReactNode;

  /**
   * 抽象类？
   */
  abstract?: boolean;

  properties?: PropertyDSL[];
  classProperties?: PropertyDSL[];

  methods?: MethodDSL[];
  classMethods?: MethodDSL[];
}

/**
 * 类 UML 基础渲染
 */
export const ClassShapeBase: FC<ClassShapeBaseProps> = observer(function ClassShapeBase(props) {
  const {
    className,
    style,
    type,
    name,
    showName = true,
    title,
    abstract,
    properties,
    classProperties,
    methods,
    classMethods,
  } = props;
  const hasProperties = !!(properties?.length || classProperties?.length);
  const hasMethods = !!(methods?.length || classMethods?.length);

  return (
    <div className={classNames('shape-class', s.root, className)} style={style}>
      <div className={classNames('shape-class__header', s.header)}>
        {!!type && <div className={classNames('shape-class__type', s.type)}>《{type}》</div>}
        {showName && (
          <div className={classNames('shape-class__name', s.name, { abstract: abstract })}>
            {title || UntitledInHumanReadable}({name || UntitledInUpperCamelCase})
          </div>
        )}
      </div>
      {hasProperties && (
        <div className={classNames('shape-class__cells', s.cells)}>
          {classProperties?.map(i => {
            return <ClassShapeProperty key={i.uuid} value={i} isClassMember></ClassShapeProperty>;
          })}
          {properties?.map(i => {
            return <ClassShapeProperty key={i.uuid} value={i}></ClassShapeProperty>;
          })}
        </div>
      )}
      {hasMethods && (
        <div className={classNames('shape-class__cells', s.cells)}>
          {classMethods?.map(i => {
            return <ClassShapeMethod key={i.uuid} value={i} isClassMember></ClassShapeMethod>;
          })}
          {methods?.map(i => {
            return <ClassShapeMethod key={i.uuid} value={i}></ClassShapeMethod>;
          })}
        </div>
      )}
    </div>
  );
});

export const ClassShape: FC<ClassShapeProps> = observer(function ClassShape(props) {
  const { dsl, type, className, style } = props;

  return (
    <ClassShapeBase
      className={className}
      style={style}
      type={type}
      name={dsl.name}
      title={dsl.title}
      abstract={dsl.abstract}
      properties={dsl.properties}
      classProperties={dsl.classProperties}
      methods={dsl.methods}
      classMethods={dsl.classMethods}
    />
  );
});
