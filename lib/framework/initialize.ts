import { setCurrentPageInstanceGetter, clearPageScope } from '@wakeapp/framework-core';

let currentPageScope: any;

export function createPageScope() {
  const instance = (currentPageScope = {});

  return () => {
    clearPageScope(instance);
  };
}

setCurrentPageInstanceGetter(() => {
  if (currentPageScope == null) {
    throw new Error(`页面作用域的依赖注入只能用于组件内部`);
  }

  return currentPageScope;
});
