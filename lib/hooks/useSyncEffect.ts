import { useMemo, useRef, useEffect } from 'react';

export const useSyncEffect: typeof useEffect = (effect, deps) => {
  let lastDestructor = useRef<any>();
  useMemo(() => {
    if (typeof lastDestructor.current === 'function') {
      lastDestructor.current();
    }

    lastDestructor.current = effect();
  }, deps);
};
