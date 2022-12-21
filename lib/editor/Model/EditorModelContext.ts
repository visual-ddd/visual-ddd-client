import { useDisposer } from '@wakeapp/hooks';
import { createContext, useContext, useRef } from 'react';
import { BaseEditorEventDefinitions, BaseEditorEventsWithArg, BaseEditorEventsWithoutArg } from './BaseEditorEvent';
import { BaseEditorModel } from './BaseEditorModel';

const CONTEXT = createContext<BaseEditorModel | null>(null);
CONTEXT.displayName = 'EditorModelContext';

export const EditorModelProvider = CONTEXT.Provider;

export function useEditorModel<Model extends BaseEditorModel = BaseEditorModel>() {
  const model = useContext(CONTEXT) as Model | null;

  if (model == null) {
    throw new Error(`请在 EditorModelProvider 上下文下使用`);
  }

  const handlers = useRef<Map<string, Function>>();
  const disposer = useDisposer();

  /**
   * 事件监听
   * @param name
   * @param listener
   */
  function listen<T extends BaseEditorEventsWithoutArg>(name: T, listener: () => void): void;
  function listen<T extends BaseEditorEventsWithArg>(
    name: T,
    listener: (arg: BaseEditorEventDefinitions[T]) => void
  ): void;
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

      disposer.push(model!.event.on(name as any, delegateListener));
    }

    // 保存
    handlers.current.set(name, listener);
  }

  return {
    model,
    store: model.store,
    viewStore: model.viewStore,
    formStore: model.formStore,
    event: model.event,
    commandHandler: model.commandHandler,
    index: model.index,
    listen,
  };
}
