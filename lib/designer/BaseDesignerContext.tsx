import { createContext, useContext } from 'react';
import { BaseDesignerModel } from './BaseDesignerModel';

const CONTEXT = createContext<BaseDesignerModel<any, any> | null>(null);

export function useDesignerContext<Model extends BaseDesignerModel<any, any> = BaseDesignerModel<any, any>>(): Model {
  const context = useContext(CONTEXT);
  if (!context) {
    throw new Error('Designer context is not available');
  }

  return context as Model;
}

export function DesignerContextProvider<Model extends BaseDesignerModel<any, any> = BaseDesignerModel<any, any>>(
  props: React.PropsWithChildren<{ model: Model }>
): React.ReactElement {
  return <CONTEXT.Provider value={props.model}>{props.children}</CONTEXT.Provider>;
}
