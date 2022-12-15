import { storeAutoBindingKey } from './auto-bind-this';

/**
 * 副作用操作
 * TODO: 支持 loading, error, result 等附加状态
 */
export const effect = (name: string): MethodDecorator => {
  return (target, key) => {
    storeAutoBindingKey(target, key);
  };
};
