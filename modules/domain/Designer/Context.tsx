import { createContext, useContext } from 'react';
import { DomainDesignerModel } from './model';

const CONTEXT = createContext<DomainDesignerModel | null>(null);
CONTEXT.displayName = 'DomainDesignerContext';

export function useDomainDesignerContext() {
  return useContext(CONTEXT);
}

export const DomainDesignerContextProvider = CONTEXT.Provider;
