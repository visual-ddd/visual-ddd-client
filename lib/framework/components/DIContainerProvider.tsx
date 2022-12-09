import React, { FC } from 'react';
import { Container } from '@wakeapp/framework-core';

import { DIContainerContext } from './DIContainerContext';

/**
 * 提供依赖注入容器. 下级组件将优先从这个容器获取依赖
 * @param props
 * @returns
 */
export const DIContainerProvider: FC<{ container: Container; children?: React.ReactNode }> = props => {
  return <DIContainerContext.Provider value={props.container}>{props.children}</DIContainerContext.Provider>;
};
