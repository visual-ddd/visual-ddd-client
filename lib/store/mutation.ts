import { action } from 'mobx';

/**
 * 状态变更操作
 */
export const mutation: (customName: string) => PropertyDecorator = action;
