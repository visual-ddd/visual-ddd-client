import { storeAutoBindingKey } from './auto-bind-this';

/**
 * 副作用操作
 * TODO: 支持 loading, error, result 等附加状态
 */
export const effect = (name: string): MethodDecorator => {
  return (target, key, descriptor) => {
    const origin = descriptor.value as Function;

    // @ts-expect-error
    descriptor.value = function () {
      const self = this;
      const args = arguments;

      if (process.env.NODE_ENV !== 'production') {
        console.debug(`Running Effect: ${name}`, args?.[0]);
      }

      return origin.apply(self, args);
    };

    storeAutoBindingKey(target, key);
  };
};
