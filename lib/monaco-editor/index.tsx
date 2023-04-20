import { RefObject, useEffect, useRef } from 'react';
import type monaco from 'monaco-editor';
import { assert } from '@/lib/utils';
import { useRefValue } from '@wakeapp/hooks';
import { loadMonaco } from './loader';

export function useMonaco(onLoad: (params: { element: RefObject<HTMLDivElement> }) => monaco.editor.IEditor) {
  const element = useRef<HTMLDivElement>(null);
  const loader = useRefValue(onLoad);
  const elementRef = useRef<monaco.editor.IEditor>();

  const load = async () => {
    await loadMonaco();
    assert(element.current, 'element.current should not be null');

    elementRef.current = loader.current({ element });
  };

  useEffect(() => {
    load();

    return () => {
      if (elementRef.current) {
        elementRef.current.dispose();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    element,
  };
}
