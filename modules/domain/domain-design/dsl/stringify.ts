/**
 * 序列化为字符串
 */
import { AccessModifier, UntitledInCamelCase, Void, VoidClass } from './constants';
import { AccessDSL, MethodDSL, ParameterDSL, PropertyDSL, TypeDSL, TypeType } from './dsl';

export function stringifyTypeDSL(type?: TypeDSL, getReferenceTypeName?: (id: string, name: string) => string): string {
  if (type == null) {
    return VoidClass;
  }

  switch (type.type) {
    case TypeType.Container: {
      switch (type.name) {
        case 'Map':
          return `Map<${stringifyTypeDSL(type.params.key, getReferenceTypeName)}, ${stringifyTypeDSL(
            type.params.value,
            getReferenceTypeName
          )}>`;
        default:
          return `${type.name}<${stringifyTypeDSL(type.params.item, getReferenceTypeName)}>`;
      }
    }
    case TypeType.Reference:
      if (getReferenceTypeName) {
        return getReferenceTypeName(type.referenceId, type.name);
      } else {
        return type.name;
      }
    default:
      return type.name;
  }

  return VoidClass;
}

export function stringifyMethodResult(type?: TypeDSL, getReferenceTypeName?: (id: string, name: string) => string) {
  return type == null ? Void : stringifyTypeDSL(type, getReferenceTypeName);
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
