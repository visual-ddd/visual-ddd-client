import { NoopArray } from '@wakeapp/utils';
import uniq from 'lodash/uniq';

import { ClassDSL, EntityDSL, MethodDSL, ParameterDSL, PropertyDSL, TypeDSL, TypeType, ValueObjectDSL } from './dsl';

export function extraDependenciesFromTypeDSL(type?: TypeDSL): string[] {
  if (!type) {
    return NoopArray;
  }

  switch (type.type) {
    case TypeType.Base:
      return NoopArray;
    case TypeType.Reference:
      return [type.referenceId];
    case TypeType.Container: {
      switch (type.name) {
        case 'Map':
          return uniq(
            extraDependenciesFromTypeDSL(type.params.key).concat(extraDependenciesFromTypeDSL(type.params.value))
          );
        default:
          return extraDependenciesFromTypeDSL(type.params.item);
      }
    }
  }
}

export function extraDependenciesFromProperties(properties: PropertyDSL[]): string[] {
  return uniq(properties.map(i => extraDependenciesFromTypeDSL(i.type)).flat());
}

export function extraDependenciesFromParameters(parameters: ParameterDSL[]): string[] {
  return uniq(parameters.map(i => extraDependenciesFromTypeDSL(i.type)).flat());
}

export function extraDependenciesFromMethods(methods: MethodDSL[]): string[] {
  return uniq(
    methods
      .map(i => {
        return extraDependenciesFromParameters(i.parameters).concat(extraDependenciesFromTypeDSL(i.result));
      })
      .flat()
  );
}

export function extraDependenciesFromClass(type: ClassDSL) {
  return uniq(
    extraDependenciesFromProperties(type.properties).concat(
      extraDependenciesFromParameters(type.classProperties),
      extraDependenciesFromMethods(type.methods),
      extraDependenciesFromMethods(type.classMethods)
    )
  );
}

export function extraDependenciesFromEntity(type: EntityDSL) {
  return extraDependenciesFromClass(type);
}

export function extraDependenciesFromValueObject(type: ValueObjectDSL) {
  return extraDependenciesFromClass(type);
}
