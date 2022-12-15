import { useDisposer } from '@wakeapp/hooks';
import { createContext, useContext, useEffect, useMemo, useRef } from 'react';
import { useEditorModel } from '../Model';
import { CanvasEventDefinitions, CanvasEventsWithArg, CanvasEventsWithoutArg } from './CanvasEvent';
import { CanvasModel } from './CanvasModel';

const CONTEXT = createContext<CanvasModel | undefined>(undefined);
CONTEXT.displayName = 'CanvasModelContext';

export interface CanvasModelProviderProps {
  options?: {}; // TODO
  children?: React.ReactNode;
}

/**
 * TODO: 扩展参数
 * @param props
 * @returns
 */
export const CanvasModelProvider = (props: CanvasModelProviderProps) => {
  const { model: editorModel } = useEditorModel();

  const canvasModel = useMemo(() => {
    return new CanvasModel({ editorModel });
  }, [editorModel]);

  useEffect(() => {
    return () => {
      // 资源释放
      canvasModel.dispose();
    };
  }, [canvasModel]);

  return <CONTEXT.Provider value={canvasModel}>{props.children}</CONTEXT.Provider>;
};

export function useCanvasModel() {
  const model = useContext(CONTEXT);

  if (model == null) {
    throw new Error(`请在 CanvasModelProvider 上下文下使用`);
  }

  const handlers = useRef<Map<string, Function>>();
  const disposer = useDisposer();

  /**
   * 事件监听
   * @param name
   * @param listener
   */
  function listen<T extends CanvasEventsWithoutArg>(name: T, listener: () => void): void;
  function listen<T extends CanvasEventsWithArg>(name: T, listener: (arg: CanvasEventDefinitions[T]) => void): void;
  function listen(name: string, listener: Function): void {
    // 初始化
    if (handlers.current == null) {
      handlers.current = new Map();
    }

    // new listener
    if (!handlers.current.has(name)) {
      const delegateListener = (...args: any[]) => {
        handlers.current?.get(name)?.apply(null, args);
      };

      // @ts-expect-error
      disposer.push(model!.event.on(name, delegateListener));
    }

    // 保存
    handlers.current.set(name, listener);
  }

  return {
    model,
    listen,
  };
}
