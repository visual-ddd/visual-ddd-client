import { ReactDecorator } from '@/lib/g6-binding';
import { observer } from 'mobx-react';

/**
 * 支持 mobx 数据响应式
 */
export const ObserverDecorator: ReactDecorator = Input => {
  return observer(Input);
};
