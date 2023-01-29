import { memoize } from 'lodash';
import { useMemo } from 'react';

import { OTHER_KEY_MAP, MAC_OS_KEY_MAP } from '@/lib/contants';

import { useIsMacos } from './useIsMacos';

/**
 * 获取可读的快捷键描述
 * @returns
 */
export function useReadableKeyBinding() {
  const isMacos = useIsMacos();

  const getter = useMemo(
    () =>
      memoize((key: string) => {
        return key
          .split('+')
          .map(i => {
            const k = i.trim();
            if (isMacos) {
              if (k in MAC_OS_KEY_MAP) {
                return MAC_OS_KEY_MAP[k];
              }
            } else if (k in OTHER_KEY_MAP) {
              return OTHER_KEY_MAP[k];
            }

            return k;
          })
          .join(' + ');
      }),
    [isMacos]
  );

  return (keys: { macos: string; other: string }) => {
    return isMacos ? getter(keys.macos) : getter(keys.other);
  };
}
