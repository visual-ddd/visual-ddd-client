import { generateInterface } from '@/lib/typescript';
import { PropertyDSL, stringifyTypeDSLToTypescript } from '../dsl';
import { DomainObject } from './DomainObject';

export function toTypescriptInteface(
  object: DomainObject<any>,
  properties: PropertyDSL[],
  getObject: (id: string) => DomainObject<any> | undefined,
  objectsInclued?: Set<DomainObject<any>>
) {
  const deps: Set<DomainObject<any>> = objectsInclued ?? new Set();

  const codes: string[] = [];

  deps.add(object);

  codes.push(
    generateInterface({
      comment: {
        title: object.title,
        description: object.description,
      },
      name: object.name,
      properties: properties.map(p => {
        return {
          optional: p.optional,
          name: p.name,
          type: stringifyTypeDSLToTypescript(p.type, (id, name) => {
            const obj = getObject(id);

            if (obj) {
              deps.add(obj);

              return obj.name || name;
            }

            return name;
          }),
          comment: {
            title: p.title,
            description: p.description,
          },
        };
      }),
    })
  );

  // 依赖代码
  if (!objectsInclued && deps.size) {
    let objectsToTransform = new Set(deps);

    while (objectsToTransform.size) {
      const snapshot = new Set(deps);

      for (const obj of objectsToTransform) {
        if (obj === object) {
          // 跳过自身
          continue;
        }

        codes.push(obj.toTypescript(deps));
      }

      // 有新的依赖追加进来
      if (snapshot.size !== deps.size) {
        objectsToTransform = new Set(deps);
        for (const obj of snapshot) {
          objectsToTransform.delete(obj);
        }
      } else {
        break;
      }
    }
  }

  return codes.filter(Boolean).join('\n\n');
}
