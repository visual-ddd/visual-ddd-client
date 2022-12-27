/**
 * 序列化类型信息为 React 组件
 */
import React from 'react';
import { ReferenceTypeDisplay } from './components/ReferenceTypeDisplay';
import { arrayJoin } from '@wakeapp/utils';
import { UntitledInCamelCase, Void, VoidClass } from './constants';
import { MethodDSL, ParameterDSL, PropertyDSL, TypeDSL, TypeType } from './dsl';
import { stringifyAccess } from './stringify';

export function reactifyTypeDSL(type?: TypeDSL): React.ReactNode {
  if (type == null) {
    return VoidClass;
  }

  switch (type.type) {
    case TypeType.Container: {
      switch (type.name) {
        case 'Map':
          return (
            <>
              Map{'<'}
              {reactifyTypeDSL(type.params.key)}, {reactifyTypeDSL(type.params.value)}
              {'>'}
            </>
          );
        default:
          return (
            <>
              {type.name}
              {'<'}
              {reactifyTypeDSL(type.params.item)}
              {'>'}
            </>
          );
      }
    }
    case TypeType.Base:
      return type.name;
    default:
      // 引用类型
      return <ReferenceTypeDisplay referenceId={type.referenceId} name={type.name} />;
  }

  return VoidClass;
}

/**
 * 序列化方法返回值
 * @param type
 * @returns
 */
export function reactifyMethodResult(type?: TypeDSL): React.ReactNode {
  return type == null ? Void : reactifyTypeDSL(type);
}

/**
 * 序列化方法参数
 * @param parameter
 * @returns
 */
export function reactifyParameter(parameter: ParameterDSL, index: number): React.ReactNode {
  return (
    <>
      {parameter.name || 'arg' + index}: {reactifyTypeDSL(parameter.type)}
    </>
  );
}

/**
 * 序列化方法参数
 * @param parameters
 * @returns
 */
export function reactifyParameters(parameters: ParameterDSL[]): React.ReactNode {
  return arrayJoin(
    parameters.map((i, idx) => {
      return reactifyParameter(i, idx);
    }),
    ', '
  );
}

export function reactifyProperty(property: PropertyDSL): React.ReactNode {
  return (
    <>
      {stringifyAccess(property.access)}
      {property.name || UntitledInCamelCase}: {reactifyTypeDSL(property.type)}
    </>
  );
}

/**
 * 序列化方法
 * @param method
 * @returns
 */
export function reactifyMethod(method: MethodDSL): React.ReactNode {
  return (
    <>
      {stringifyAccess(method.access)}
      {method.name || UntitledInCamelCase}({reactifyParameters(method.parameters)}){': '}
      {reactifyMethodResult(method.result)}
    </>
  );
}
