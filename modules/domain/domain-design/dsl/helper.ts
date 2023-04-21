import { ContainerTypeDSL, ReferenceTypeDSL, TypeDSL, TypeType } from './dsl';

export function isTypeDSLEqual(a?: TypeDSL, b?: TypeDSL): boolean {
  if (a == null || b == null) {
    return false;
  }

  if (a.type !== b.type) {
    return false;
  }

  switch (a.type) {
    case TypeType.Base:
      return a.name === b.name;
    case TypeType.Container:
      return (
        a.name === b.name &&
        Object.keys(a.params).every(paramName => {
          const aParam = a.params[paramName];
          const bParam = (b as ContainerTypeDSL).params[paramName];

          return isTypeDSLEqual(aParam, bParam);
        })
      );
    case TypeType.Reference:
      return a.referenceId === (b as ReferenceTypeDSL).referenceId;
  }
}
