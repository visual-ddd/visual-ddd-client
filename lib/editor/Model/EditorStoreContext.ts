import { useDisposer } from '@wakeapp/hooks';
import { createContext, useContext, useRef } from 'react';
import { BaseEditorEvents, BaseEditorEventsWithArg, BaseEditorEventsWithoutArg } from './BaseEditorCommandHandler';
import { BaseEditorStore } from './BaseEditorStore';

const CONTEXT = createContext<BaseEditorStore | null>(null);
CONTEXT.displayName = 'EditorStoreContext';

export const EditorStoreProvider = CONTEXT.Provider;

export function useEditorStore<Store extends BaseEditorStore = BaseEditorStore>() {
  const store = useContext(CONTEXT) as Store | null;

  if (store == null) {
    throw new Error(`请在 EditorStoreProvider 上下文下使用`);
  }

  const handlers = useRef<Map<string, Function>>();
  const disposer = useDisposer();

  /**
   * 命令处理器
   */
  const commandHandler = store.commandHandler;

  /**
   * 事件监听
   * @param name
   * @param listener
   */
  function listen<T extends BaseEditorEventsWithoutArg>(name: T, listener: () => void): void;
  function listen<T extends BaseEditorEventsWithArg>(name: T, listener: (arg: BaseEditorEvents[T]) => void): void;
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

      disposer.push(commandHandler.on(name as any, delegateListener));
    }

    // 保存
    handlers.current.set(name, listener);
  }

  return {
    store,
    commandHandler: store.commandHandler,
    listen,
  };
}
