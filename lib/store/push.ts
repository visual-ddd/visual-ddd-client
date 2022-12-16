import { storeAutoBindingKey } from './auto-bind-this';
import { isInMutation } from './mutation';
import { isInPull } from './pull';

let UNDER_PUSH = 0;

export const runInPush = (name: string, args: any, runner: () => any) => {
  try {
    UNDER_PUSH++;

    if (process.env.NODE_ENV !== 'production') {
      console.debug(`Running Push: ${name}`, args?.[0]);
    }

    return runner();
  } finally {
    UNDER_PUSH--;
  }
};

export const isInPush = () => {
  return !!UNDER_PUSH;
};

/**
 * 推送更新，主要用于执行数据库更新，进行一些持久化动作
 * @param name
 */
export const push = (name: string): MethodDecorator => {
  return function (target, key, descriptor) {
    const origin = descriptor.value as Function;

    // @ts-expect-error
    descriptor.value = function () {
      if (!isInMutation()) {
        throw new Error(`@push(${name}) 不能直接调用，只能在 @mutation 方法下调用`);
      }

      if (isInPull()) {
        // 避免循环, 跳过
        return;
      }

      const self = this;
      const args = arguments;

      return runInPush(name, args, () => {
        return origin.apply(self, args);
      });
    };

    storeAutoBindingKey(target, key);
  };
};
