import { createContext, useContext } from 'react';
import { ScenarioDesignerModel } from './model';

const CONTEXT = createContext<ScenarioDesignerModel | null>(null);
CONTEXT.displayName = 'DomainDesignerContext';

export function useScenarioDesignerContext() {
  return useContext(CONTEXT);
}

export const ScenarioDesignerContextProvider = CONTEXT.Provider;
