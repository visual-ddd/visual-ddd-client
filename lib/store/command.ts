import { storeAutoBindingKey } from './auto-bind-this';

let UNDER_COMMAND = 0;

export const runInCommand = (name: string, args: any, runner: () => any) => {
  try {
    UNDER_COMMAND++;

    if (process.env.NODE_ENV !== 'production') {
      console.debug(`Running Command: ${name}`, args?.[0]);
    }

    return runner();
  } finally {
    UNDER_COMMAND--;
  }
};

export const isInCommand = () => {
  return !!UNDER_COMMAND;
};

/**
 * 命令，主要用于执行 mutation，并且在执行 mutation 之前进行一些验证的操作
 * @param name
 */
export const command = (name: string): MethodDecorator => {
  return function (target, key, descriptor) {
    const origin = descriptor.value as Function;

    // @ts-expect-error
    descriptor.value = function () {
      const self = this;
      const args = arguments;

      return runInCommand(name, args, () => {
        return origin.apply(self, args);
      });
    };

    storeAutoBindingKey(target, key);
  };
};
