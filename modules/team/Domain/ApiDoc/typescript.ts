import { generateEnum, generateInterface } from '@/lib/typescript';
import type { BaseType, ContainerType } from '@/modules/domain/api/dsl/interface';
import { ObjectDSL, ObjectType, parseType } from './extra-api';
import { NoopArray } from '@wakeapp/utils';

export const BaseTypeToTypescriptTypeMap: Record<BaseType | ContainerType, string> = {
  String: 'string',
  Integer: 'number',
  Long: 'number',
  Double: 'number',
  Float: 'number',
  Date: 'Date',
  Boolean: 'boolean',
  BigDecimal: 'number',
  Char: 'string',
  Byte: 'number',
  Short: 'number',
  Void: 'void',
  List: 'Array',
  Map: 'Map',
  Set: 'Set',
};

const BaseTypeToTypescriptTypeInRegexp = new RegExp(
  `\\b(${Object.keys(BaseTypeToTypescriptTypeMap).join('|')})\\b`,
  'g'
);

/**
 * 转换类型
 * @param type
 * @returns
 */
export function replaceType(type: string) {
  return type.replace(BaseTypeToTypescriptTypeInRegexp, (_, $1) => {
    return BaseTypeToTypescriptTypeMap[$1 as BaseType | ContainerType];
  });
}

export function toEnum(object: ObjectDSL) {
  return generateEnum({
    comment: {
      title: object.title,
      description: object.description,
    },
    name: object.name,
    member:
      object.properties?.map(i => {
        return {
          comment: {
            title: i.title,
            description: i.description,
          },
          name: i.name,
          // @ts-expect-error
          code: i.code,
        };
      }) ?? [],
  });
}

export function toInterface(
  object: ObjectDSL,
  references: Record<string, ObjectDSL>,
  objectGenerated: Set<string>
): string[] {
  const deps: Set<string> = new Set();

  if (objectGenerated.has(object.uuid)) {
    return NoopArray;
  }

  objectGenerated.add(object.uuid);

  const code = generateInterface({
    comment: {
      title: object.title,
      description: object.description,
    },
    name: object.name,
    properties:
      object.properties?.map(i => {
        const types = parseType(i.type, (name, id) => {
          deps.add(id);

          return name;
        });

        return {
          comment: {
            title: i.title,
            description: i.description,
          },
          name: i.name,
          optional: i.optional,
          type: replaceType(types.join('')),
        };
      }) ?? [],
  });

  if (object.result) {
    parseType(object.result, (name, id) => {
      deps.add(id);
    });
  }

  if (deps) {
    // 递归处理依赖
    return Array.from(deps)
      .map(i => {
        const obj = references[i];

        if (obj && objectGenerated.has(obj.uuid)) {
          return NoopArray;
        }

        if (obj.type === ObjectType.Enum) {
          return [toEnum(obj)];
        } else if (obj) {
          return toInterface(obj, references, objectGenerated);
        } else {
          return NoopArray;
        }
      })
      .flat()
      .filter(Boolean)
      .concat([code]);
  } else {
    return [code];
  }
}

/**
 * 生成 Typescript 类型声明
 */
export function toTypescript(object: ObjectDSL, references: Record<string, ObjectDSL>) {
  switch (object.type) {
    case ObjectType.Enum:
      return toEnum(object);
    default:
      const objectGenerated = new Set<string>();
      return toInterface(object, references, objectGenerated).join('\n\n');
  }
}
