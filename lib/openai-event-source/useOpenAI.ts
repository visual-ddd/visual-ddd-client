import { useEffect, useMemo } from 'react';
import { tryDispose } from '@/lib/utils';

import { OpenAIEventSourceModel, OpenAIEventSourceModelOptions } from './OpenAIEventSourceModel';

export function useOpenAI<T = any>(options: OpenAIEventSourceModelOptions<T>, deps: any[] = []) {
  const model = useMemo(() => new OpenAIEventSourceModel(options), deps);

  useEffect(() => {
    return () => {
      tryDispose(model);
    };
  }, [model]);

  return model;
}
