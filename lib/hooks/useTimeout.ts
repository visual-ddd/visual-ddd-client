import { useEffect, useState } from 'react';

export function useTimeout() {
  const [count, setCount] = useState(0);

  const start = (seconds: number) => {
    setCount(seconds);
  };

  useEffect(() => {
    if (count > 0) {
      const timer = setTimeout(() => {
        setCount(count - 1);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [count]);

  return { count, start };
}
