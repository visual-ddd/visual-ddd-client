import { RefObject, useEffect, useRef } from 'react';
import type monaco from 'monaco-editor';
import { assert } from '@/lib/utils';
import { useRefValue } from '@wakeapp/hooks';
import { loadMonaco } from './loader';

export function useMonaco<E extends monaco.editor.IEditor>(
  onLoad: (params: { element: RefObject<HTMLDivElement> }) => E
) {
  const element = useRef<HTMLDivElement>(null);
  const loader = useRefValue(onLoad);
  const editor = useRef<E>();

  const load = async () => {
    await loadMonaco();
    assert(element.current, 'element.current should not be null');

    editor.current = loader.current({ element });
  };

  useEffect(() => {
    load();

    return () => {
      if (editor.current) {
        editor.current.dispose();
        editor.current = undefined;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    element,
    editor,
  };
}
