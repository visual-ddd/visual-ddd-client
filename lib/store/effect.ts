import { storeAutoBindingKey } from './auto-bind-this';

/**
 * 副作用操作
 */
export const effect = (name: string): MethodDecorator => {
  return (target, key) => {
    storeAutoBindingKey(target, key);
  };
};
