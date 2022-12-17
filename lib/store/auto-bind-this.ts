const AUTO_BINDING_KEY = Symbol('AUTO_BINDING');

export function storeAutoBindingKey(target: any, key: string | symbol) {
  const desc = Object.getOwnPropertyDescriptor(target, AUTO_BINDING_KEY);

  if (desc == null) {
    const prototype = Object.getPrototypeOf(target);
    const value = new Set([key]);

    // 继承
    if (prototype?.[AUTO_BINDING_KEY]) {
      (prototype[AUTO_BINDING_KEY] as Set<string>).forEach(k => {
        value.add(k);
      });
    }

    Object.defineProperty(target, AUTO_BINDING_KEY, {
      enumerable: false,
      configurable: false,
      value,
    });
  }

  desc?.value.add(key);
}

export function makeAutoBindThis(target: any) {
  const values = target[AUTO_BINDING_KEY];

  if (values instanceof Set) {
    for (const key of values) {
      const originProperty = target[key];
      if (typeof originProperty === 'function') {
        target[key] = originProperty.bind(target);
      }
    }
  }
}
