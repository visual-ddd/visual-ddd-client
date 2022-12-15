import { storeAutoBindingKey } from './auto-bind-this';
import { isInMutation } from './mutation';

let UNDER_UPDATE = 0;

export const runInUpdate = (name: string, args: any, runner: () => any) => {
  try {
    UNDER_UPDATE++;

    if (process.env.NODE_ENV !== 'production') {
      console.debug(`Running Update: ${name}`, args?.[0]);
    }

    return runner();
  } finally {
    UNDER_UPDATE--;
  }
};

export const isInUpdate = () => {
  return !!UNDER_UPDATE;
};

/**
 * 更新，主要用于执行数据库更新，进行一些持久化动作
 * @param name
 */
export const update = (name: string): MethodDecorator => {
  return function (target, key, descriptor) {
    const origin = descriptor.value as Function;

    // @ts-expect-error
    descriptor.value = function () {
      if (!isInMutation()) {
        throw new Error(`@update(${name}) 不能直接调用，只能在 @mutation 方法下调用`);
      }

      const self = this;
      const args = arguments;

      return runInUpdate(name, args, () => {
        return origin.apply(self, args);
      });
    };

    storeAutoBindingKey(target, key);
  };
};
