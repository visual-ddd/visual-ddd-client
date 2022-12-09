import { useContext } from 'react';
import { Container } from '@wakeapp/framework-core';
import { DIContainerContext } from '../components/DIContainerContext';

/**
 * 获取依赖注入容器
 * @returns
 */
export function useDIContainer(): Container {
  return useContext(DIContainerContext);
}
