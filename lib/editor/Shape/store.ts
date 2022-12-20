import { ShapeConfiguration } from './types';

/**
 * 所有已注册的图形
 */
export const shapes: Map<string, ShapeConfiguration> = new Map();

/**
 * 获取已注册图形
 * @param name
 * @returns
 */
export function getShape(name: string): ShapeConfiguration | undefined {
  return shapes.get(name);
}

/**
 * 获取验证规则
 * @param name
 * @returns
 */
export function getRules(name: string) {
  return getShape(name)?.rules;
}
