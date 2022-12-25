import { AccessModifier, UntitledInCamelCase, Void, VoidClass } from './constants';
import { AccessDSL, MethodDSL, ParameterDSL, PropertyDSL, TypeDSL, TypeType } from './dsl';

// TODO: 引用标题响应化
export function stringifyTypeDSL(type?: TypeDSL): string {
  if (type == null) {
    return VoidClass;
  }

  switch (type.type) {
    case TypeType.Container: {
      switch (type.name) {
        case 'Map':
          return `Map<${stringifyTypeDSL(type.params.key)}, ${stringifyTypeDSL(type.params.value)}>`;
        default:
          return `${type.name}<${stringifyTypeDSL(type.params.item)}>`;
      }
    }
    default:
      return type.name;
  }

  return VoidClass;
}

export function stringifyMethodResult(type?: TypeDSL) {
  return type == null ? Void : stringifyTypeDSL(type);
}

/**
 * 序列化方法参数
 * @param parameter
 * @returns
 */
export function stringifyParameter(parameter: ParameterDSL, index: number) {
  return `${parameter.name || 'arg' + index}: ${stringifyTypeDSL(parameter.type)}`;
}

/**
 * 序列化方法参数
 * @param parameters
 * @returns
 */
export function stringifyParameters(parameters: ParameterDSL[]) {
  return parameters
    .map((i, idx) => {
      return stringifyParameter(i, idx);
    })
    .join(', ');
}

export function stringifyAccess(access?: AccessDSL) {
  return AccessModifier[access || 'public'];
}

export function stringifyProperty(property: PropertyDSL) {
  return `${stringifyAccess(property.access)}${property.name || UntitledInCamelCase}: ${stringifyTypeDSL(
    property.type
  )}`;
}

export function stringifyMethod(method: MethodDSL) {
  return `${stringifyAccess(method.access)}${method.name || UntitledInCamelCase}(${stringifyParameters(
    method.parameters
  )}): ${stringifyMethodResult(method.result)}`;
}
