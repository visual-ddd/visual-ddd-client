import { generateEnum, generateInterface } from '@/lib/typescript';
import { ObjectDSL, ObjectType, parseType } from './extra-api';
import { NoopArray } from '@wakeapp/utils';

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
          type: types.join(''),
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
