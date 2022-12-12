import { createContext, useContext } from 'react';
import { CellContextValue } from './types';

const Context = createContext<CellContextValue | null>(null);

export function useCellContext() {
  return useContext(Context);
}

export const CellContextProvider = Context.Provider;
