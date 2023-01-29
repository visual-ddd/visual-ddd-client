import { useState } from 'react';

const test = (): boolean => {
  return /macintosh|mac os x/i.test(window.navigator.userAgent);
};

export function useIsMacos() {
  const [result] = useState(test);
  return result;
}
