import type { ComponentType } from 'react';
import {
  DIIdentifier,
  DIValue,
  DIRegisterOptions,
  registerConstant,
  __getLastRegisteredDeps,
  __bindLastOptions,
  __registerDIMethods,
} from '@wakeapp/framework-core';

/**
 * 注册组件
 * 这是 registerConstant 的别名
 */
export function registerComponent<I extends DIIdentifier, T extends DIValue<I>>(
  identifier: I,
  target: ComponentType<T>,
  options?: DIRegisterOptions
): void {
  const LAST_REGISTERED_DEPS = __getLastRegisteredDeps(options?.container);
  if (!options?.override && LAST_REGISTERED_DEPS[identifier] != null) {
    throw new Error(`${identifier} 组件已经注册过`);
  }

  registerConstant(identifier, target as any, options);
}

/**
 * 覆盖组件
 */
export const overrideComponent = __bindLastOptions(registerComponent, { override: true });

declare global {
  interface IDIRegisters {
    registerComponent: typeof registerComponent;
  }

  interface IDIOverrides {
    overrideComponent: typeof overrideComponent;
  }
}

__registerDIMethods({ registers: { registerComponent }, overrides: { overrideComponent } });
