import React, { FC } from 'react';
import { observer } from 'mobx-react';
import classNames from 'classnames';
import { NoopArray } from '@wakeapp/utils';
import { usePropertyLocationNavigate } from '@/lib/editor';

import { PropertyDSL, MethodDSL, ClassDSL } from '../../dsl';
import { reactifyMethod, reactifyProperty } from '../../reactify';
import { UntitledInHumanReadable, UntitledInUpperCamelCase } from '../../constants';

import s from './ClassShape.module.scss';

export interface ClassShapePropertyBaseProps extends React.HTMLAttributes<HTMLDivElement> {
  name?: React.ReactNode;
  comment?: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * 基础列表项
 */
export const ClassShapePropertyBase = (props: ClassShapePropertyBaseProps) => {
  const { name, comment, className, ...other } = props;
  return (
    <div className={classNames('shape-class-property', s.property, className)} {...other}>
      <span className={classNames('shape-class-property__name', s.propertyName)}>{name}</span>
      <span className={classNames('shape-class-property__comment', s.propertyComment)} title={comment}>
        {comment}
      </span>
    </div>
  );
};

/**
 * 列表项容器
 * @param props
 * @returns
 */
export const ClassShapeCells = (props: React.HTMLProps<HTMLDivElement>) => {
  return <div {...props} className={classNames('shape-class__cells', s.cells, props.className)}></div>;
};

export interface ClassShapePropertyProps extends React.HTMLAttributes<HTMLDivElement> {
  value: PropertyDSL;
  isClassMember?: boolean;
}

/**
 * 属性渲染
 */
export const ClassShapeProperty = observer(function Property(props: ClassShapePropertyProps) {
  const { value, isClassMember, className, ...other } = props;
  const { title, description } = value;

  return (
    <div className={classNames('shape-class-property', s.property, className)} {...other}>
      <span
        className={classNames('shape-class-property__name', s.propertyName, { class: isClassMember })}
        title={title}
      >
        {reactifyProperty(value)}
      </span>
      <span className={classNames('shape-class-property__comment', s.propertyComment)} title={description}>
        {title}
      </span>
    </div>
  );
});

export interface ClassShapeMethodProps extends React.HTMLAttributes<HTMLDivElement> {
  value: MethodDSL;
  isClassMember?: boolean;
}

/**
 * 方法渲染
 */
export const ClassShapeMethod = observer(function Method(props: ClassShapeMethodProps) {
  const { value, isClassMember, className, ...other } = props;
  const { title, abstract, description } = value;

  return (
    <div className={classNames('shape-class-method', s.method, className)} {...other}>
      <span
        className={classNames('shape-class-method__name', s.methodName, { abstract, class: isClassMember })}
        title={title}
      >
        {reactifyMethod(value)}
      </span>
      <span className={classNames('shape-class-method__comment', s.methodComment)} title={description}>
        {title}
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
  onPropertyFocus?: (evt: { item: PropertyDSL; type: 'properties' | 'classProperties' }) => void;

  methods?: MethodDSL[];
  classMethods?: MethodDSL[];
  onMethodFocus?: (evt: { item: MethodDSL; type: 'methods' | 'classMethods' }) => void;

  header?: React.ReactNode;
  children?: React.ReactNode;
}

/**
 * 类 UML 基础渲染
 */
export const ClassShapeBase = observer(function ClassShapeBase(props: ClassShapeBaseProps) {
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
    onPropertyFocus,
    methods,
    classMethods,
    onMethodFocus,
    children,
    header,
  } = props;
  const hasProperties = !!(properties?.length || classProperties?.length);
  const hasMethods = !!(methods?.length || classMethods?.length);

  const handlePropertyClick = (isClassMember: boolean, property: PropertyDSL) => (evt: React.MouseEvent) => {
    evt.stopPropagation();
    evt.preventDefault();

    onPropertyFocus?.({ item: property, type: isClassMember ? 'classProperties' : 'properties' });
  };

  const handleMethodClick = (isClassMember: boolean, method: MethodDSL) => (evt: React.MouseEvent) => {
    evt.stopPropagation();
    evt.preventDefault();

    onMethodFocus?.({ item: method, type: isClassMember ? 'classMethods' : 'methods' });
  };

  return (
    <div className={classNames('shape-class', s.root, className)} style={style}>
      <div className={classNames('shape-class__header', s.header)}>
        {!!type && <div className={classNames('shape-class__type', s.type)}>《{type}》</div>}
        {showName && (
          <div className={classNames('shape-class__name', s.name, { abstract: abstract })}>
            {title || UntitledInHumanReadable}({name || UntitledInUpperCamelCase})
          </div>
        )}
        {header}
      </div>
      {hasProperties && (
        <div className={classNames('shape-class__cells', s.cells)}>
          {classProperties?.map(i => {
            return (
              <ClassShapeProperty
                key={i.uuid}
                value={i}
                isClassMember
                onDoubleClick={handlePropertyClick(true, i)}
              ></ClassShapeProperty>
            );
          })}
          {properties?.map(i => {
            return (
              <ClassShapeProperty
                key={i.uuid}
                value={i}
                onDoubleClick={handlePropertyClick(false, i)}
              ></ClassShapeProperty>
            );
          })}
        </div>
      )}
      {hasMethods && (
        <div className={classNames('shape-class__cells', s.cells)}>
          {classMethods?.map(i => {
            return (
              <ClassShapeMethod
                key={i.uuid}
                value={i}
                isClassMember
                onDoubleClick={handleMethodClick(true, i)}
              ></ClassShapeMethod>
            );
          })}
          {methods?.map(i => {
            return (
              <ClassShapeMethod key={i.uuid} value={i} onDoubleClick={handleMethodClick(false, i)}></ClassShapeMethod>
            );
          })}
        </div>
      )}
      {children}
    </div>
  );
});

/**
 * 通用类图形
 */
export const ClassShape: FC<ClassShapeProps> = observer(function ClassShape(props) {
  const { dsl, type, className, style } = props;
  const openProperty = usePropertyLocationNavigate();

  const handlePropertyFocus: ClassShapeBaseProps['onPropertyFocus'] = evt => {
    const list = dsl[evt.type] ?? NoopArray;
    const index = list.findIndex(i => i.uuid === evt.item.uuid);

    if (index === -1) {
      return;
    }

    openProperty({
      nodeId: dsl.uuid,
      path: `${evt.type}[${index}]`,
    });
  };

  // @ts-expect-error 直接通过 type 取字段，因此是兼容的
  const handleMethodFocus: ClassShapeBaseProps['onMethodFocus'] = handlePropertyFocus;

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
      onPropertyFocus={handlePropertyFocus}
      methods={dsl.methods}
      classMethods={dsl.classMethods}
      onMethodFocus={handleMethodFocus}
    />
  );
});
