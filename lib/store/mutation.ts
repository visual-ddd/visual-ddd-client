import { action } from 'mobx';
import { storeAutoBindingKey } from './auto-bind-this';
import { isInCommand } from './command';

let UNDER_MUTATION = 0;

export const runInMutation = (name: string, args: any, runner: () => any) => {
  try {
    UNDER_MUTATION++;

    if (process.env.NODE_ENV !== 'production') {
      console.debug(`Running Mutation: ${name}`, args);
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
export const mutation = (name: string): MethodDecorator => {
  const actionWithName = action(name);

  return function (target, key, descriptor) {
    const origin = descriptor.value as Function;

    // @ts-expect-error
    descriptor.value = function () {
      if (!isInCommand() && !isInMutation()) {
        throw new Error(`@mutation(${name}) 不能直接调用，只能在 @command 方法下调用`);
      }

      const self = this;
      const args = arguments;
      return runInMutation(name, args, () => {
        return origin.apply(self, args);
      });
    };

    actionWithName(target, key);
    storeAutoBindingKey(target, key);
  };
};
