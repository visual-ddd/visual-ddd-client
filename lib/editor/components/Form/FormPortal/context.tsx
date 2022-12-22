import { Noop } from '@wakeapp/utils';
import { createContext, useContext, useMemo, useRef } from 'react';

export interface EditorFormPortalContextValue {
  requestShow: (element: HTMLDivElement, onClose: () => void) => () => void;
  requestHide: (element: HTMLDivElement) => void;
}

const Context = createContext<EditorFormPortalContextValue | null>(null);
Context.displayName = 'FormPortalContext';

export function useFormPortalContext() {
  return useContext(Context);
}

export interface EditorFormPortalContextProviderProps {
  className?: string;
  style?: React.CSSProperties;
  target: string;
  children?: React.ReactNode;
}

export function EditorFormPortalContextProvider(props: EditorFormPortalContextProviderProps) {
  const { target, children, ...other } = props;
  const instanceRef = useRef<HTMLDivElement>(null);
  const context = useMemo<EditorFormPortalContextValue>(() => {
    let currentShowing: { instance: HTMLElement; onClose: () => void } | null = null;

    const ID = 'form-portal';
    const getTarget = () => {
      return instanceRef.current?.querySelector(target);
    };

    const getContainer = () => {
      const t = getTarget();
      if (t == null) {
        console.error(`FormPortalContext 无法找到 ${target}`);
        return;
      }

      let container: HTMLDivElement | null = t.querySelector(`#${ID}`);

      if (container != null) {
        return container;
      }

      container = document.createElement('div');
      container.id = ID;
      t.appendChild(container);

      return container;
    };

    const hide = () => {
      const container = getContainer();
      if (container) {
        container.innerHTML = '';
      }
    };

    const show = () => {
      const container = getContainer();
      if (container) {
        container.appendChild(currentShowing!.instance!);
      }
    };

    const hideInstance = (instance: HTMLDivElement) => {
      // destroy
      if (currentShowing?.instance === instance) {
        hide();
        currentShowing = null;
      }
    };

    return {
      requestShow(instance, onClose) {
        if (currentShowing) {
          if (currentShowing.instance === instance) {
            // 当前正在展示
            return Noop;
          }

          // 释放
          const copy = currentShowing;
          currentShowing = null;
          copy.onClose();
        }

        currentShowing = { instance, onClose };
        show();

        return () => {
          hideInstance(instance);
        };
      },

      requestHide(instance) {
        hideInstance(instance);
      },
    };
  }, [target]);

  return (
    <div ref={instanceRef} {...other}>
      <Context.Provider value={context}>{children}</Context.Provider>
    </div>
  );
}
