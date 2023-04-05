import { useMemo } from 'react';
import { useCanvasModel } from '../Canvas';
import memoize from 'lodash/memoize';

export function useCanvasModelCommandDescription() {
  const { model } = useCanvasModel();

  const getDesc = useMemo(() => {
    return memoize((name: string) => {
      const desc = model.getCommandDescription(name);

      return { tooltip: `${desc.description ?? desc.title} (${desc.key.toUpperCase()})`, handler: desc.handler };
    });
  }, [model]);

  return getDesc;
}
