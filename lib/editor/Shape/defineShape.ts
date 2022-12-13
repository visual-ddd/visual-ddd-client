import { ShapeConfiguration } from './types';
import { shapes } from './store';

/**
 * 定义图形组件
 * @param name 组件名称，必须全局唯一
 */
export function defineShape(name: string, configuration: ShapeConfiguration) {
  if (shapes.has(name)) {
    throw new Error(`defineShape ${name} already defined`);
  }

  shapes.set(name, configuration);
}
