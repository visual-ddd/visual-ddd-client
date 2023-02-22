import { useEffect, useState } from 'react';

export function useLazyFalsy(value: boolean, delay: number = 500) {
  const [delayValue, setDelayValue] = useState(value);

  useEffect(() => {
    if (value) {
      // 如果是正值，则立即更新
      setDelayValue(true);
    } else {
      // 异步更新
      const timer = setTimeout(() => {
        setDelayValue(false);
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [value, delay]);

  return delayValue;
}
