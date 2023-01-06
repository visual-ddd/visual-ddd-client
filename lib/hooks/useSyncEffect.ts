/* eslint-disable react-hooks/exhaustive-deps */
import { NoopArray } from '@wakeapp/utils';
import { useMemo, useRef, useEffect } from 'react';

export const useSyncEffect: typeof useEffect = (effect, deps) => {
  let lastDestructor = useRef<any>();
  useMemo(() => {
    if (typeof lastDestructor.current === 'function') {
      lastDestructor.current();
      lastDestructor.current = undefined;
    }

    lastDestructor.current = effect();
  }, deps);

  // 组件卸载时执行清理函数
  useEffect(() => {
    return () => {
      lastDestructor.current?.();
      lastDestructor.current = undefined;
    };
  }, NoopArray);
};
