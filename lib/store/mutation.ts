import { action } from 'mobx';
import { storeAutoBindingKey } from './auto-bind-this';
import { isInCommand } from './command';
import { isInPull } from './pull';

let UNDER_MUTATION = 0;

export const runInMutation = (name: string, runner: () => any, args?: any) => {
  try {
    UNDER_MUTATION++;

    if (process.env.NODE_ENV !== 'production') {
      console.debug(`Running Mutation: ${name}`, args?.[0]);
    }

    return runner();
  } finally {
    UNDER_MUTATION--;
  }
};

export const isInMutation = () => {
  return !!UNDER_MUTATION;
};

/**
 * 状态变更操作, 变更是同步的
 */
export const mutation = (name: string, strict = true): MethodDecorator => {
  const actionWithName = action(name);

  return function (target, key, descriptor) {
    const origin = descriptor.value as Function;

    // @ts-expect-error
    descriptor.value = function () {
      if (strict && !isInCommand() && !isInMutation() && !isInPull()) {
        throw new Error(`@mutation(${name}) 不能直接调用，只能在 @command 或 @pull 方法下调用`);
      }

      const self = this;
      const args = arguments;
      return runInMutation(
        name,
        () => {
          return origin.apply(self, args);
        },
        args
      );
    };

    actionWithName(target, key);
    storeAutoBindingKey(target, key);
  };
};
