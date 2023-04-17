import { createContext, useContext } from 'react';
import { BotPromptLibraryModel } from './BotPromptLibraryModel';

const CONTEXT = createContext<BotPromptLibraryModel | null>(null);
CONTEXT.displayName = 'BotPromptLibraryContext';

export function useBotPromptLibraryContext() {
  const context = useContext(CONTEXT);
  if (!context) {
  }

  return context;
}

export interface BotPromptLibraryProviderProps {
  model: BotPromptLibraryModel;
  children: React.ReactNode;
}

export function BotPromptLibraryProvider({ model, children }: BotPromptLibraryProviderProps) {
  return <CONTEXT.Provider value={model}>{children}</CONTEXT.Provider>;
}
