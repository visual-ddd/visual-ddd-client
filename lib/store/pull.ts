import { storeAutoBindingKey } from './auto-bind-this';

let UNDER_PULL = 0;

export const runInPull = (name: string, args: any, runner: () => any) => {
  try {
    UNDER_PULL++;

    if (process.env.NODE_ENV !== 'production') {
      console.debug(`Running Pull: ${name}`, args?.[0]);
    }

    return runner();
  } finally {
    UNDER_PULL--;
  }
};

export const isInPull = () => {
  return !!UNDER_PULL;
};

/**
 * 拉取更新，主要用于响应数据库更新, 更新到 Model 中
 * @param name
 */
export const pull = (name: string): MethodDecorator => {
  return function (target, key, descriptor) {
    const origin = descriptor.value as Function;

    // @ts-expect-error
    descriptor.value = function () {
      const self = this;
      const args = arguments;

      return runInPull(name, args, () => {
        return origin.apply(self, args);
      });
    };

    storeAutoBindingKey(target, key);
  };
};
