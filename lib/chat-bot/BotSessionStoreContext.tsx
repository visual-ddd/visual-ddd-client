import { createContext, useContext } from 'react';
import { BotSessionStore } from './BotSessionStore';

const CONTEXT = createContext<BotSessionStore | null>(null);
CONTEXT.displayName = 'BotSessionContext';

export function useBotSessionStoreContext() {
  const context = useContext(CONTEXT);
  if (!context) {
    throw new Error('useBotSessionStoreContext must be used inside a BotSessionStoreProvider');
  }

  return context;
}

export interface BotSessionStoreProviderProps {
  store: BotSessionStore;
  children: React.ReactNode;
}

export function BotSessionStoreProvider({ store, children }: BotSessionStoreProviderProps) {
  return <CONTEXT.Provider value={store}>{children}</CONTEXT.Provider>;
}
