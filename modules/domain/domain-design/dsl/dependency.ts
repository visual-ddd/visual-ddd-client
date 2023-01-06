import { NoopArray } from '@wakeapp/utils';
import uniq from 'lodash/uniq';

import {
  ClassDSL,
  CommandDSL,
  EntityDSL,
  MethodDSL,
  ParameterDSL,
  PropertyDSL,
  QueryDSL,
  RelationShipDSL,
  TypeDSL,
  TypeType,
  ValueObjectDSL,
} from './dsl';

/**
 * 从类型声明中提取引用
 * @param type
 * @returns
 */
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

export interface ClassDependencies {
  /**
   * 依赖关系
   */
  [RelationShipDSL.Dependency]: Set<string>;

  /**
   * 关联关系
   */
  [RelationShipDSL.Association]: Set<string>;
}

export function extraDependenciesFromClass(type: ClassDSL): ClassDependencies {
  const deps: ClassDependencies = {
    [RelationShipDSL.Dependency]: new Set(),
    [RelationShipDSL.Association]: new Set(),
  };

  const properties = extraDependenciesFromProperties(type.properties ?? NoopArray).concat(
    extraDependenciesFromProperties(type.classProperties ?? NoopArray)
  );

  const methods = extraDependenciesFromMethods(type.methods ?? NoopArray).concat(
    extraDependenciesFromMethods(type.classMethods ?? NoopArray)
  );

  // 属性依赖为关联关系
  for (const ref of properties) {
    deps[RelationShipDSL.Association].add(ref);
  }

  // 方法依赖为依赖关系
  for (const ref of methods) {
    // 关联关系优先级更高
    if (deps[RelationShipDSL.Association].has(ref)) {
      continue;
    }

    deps[RelationShipDSL.Dependency].add(ref);
  }

  return deps;
}

export function extraDependenciesFromEntity(type: EntityDSL) {
  return extraDependenciesFromClass(type);
}

export function extraDependenciesFromValueObject(type: ValueObjectDSL) {
  return extraDependenciesFromClass(type);
}

/**
 * 从命令中提取依赖关系
 *
 * 命令只有属性，所以都是关联关系
 */
export function extraDependenciesFromCommand(type: CommandDSL): string[] {
  return uniq(
    extraDependenciesFromProperties(type.properties).concat(extraDependenciesFromProperties(type.eventProperties))
  );
}

/**
 * 从查询中提取依赖关系
 * @param type
 * @returns
 */
export function extraDependenciesFromQuery(type: QueryDSL) {
  const deps = extraDependenciesFromClass(type as unknown as ClassDSL);
  const results = extraDependenciesFromTypeDSL(type.result);

  for (const r of results) {
    if (deps[RelationShipDSL.Association].has(r)) {
      continue;
    }

    deps[RelationShipDSL.Dependency].add(r);
  }

  return deps;
}
