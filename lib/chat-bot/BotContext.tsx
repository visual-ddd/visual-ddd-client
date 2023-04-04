import { createContext, useContext } from 'react';
import { BotModel } from './BotModel';

const CONTEXT = createContext<BotModel | null>(null);
CONTEXT.displayName = 'BotContext';

export function useBotContext() {
  const context = useContext(CONTEXT);
  if (!context) {
    throw new Error('useBotContext must be used inside a BotProvider');
  }

  return context;
}

export interface BotProviderProps {
  bot: BotModel;
  children: React.ReactNode;
}

export function BotProvider({ bot, children }: BotProviderProps) {
  return <CONTEXT.Provider value={bot}>{children}</CONTEXT.Provider>;
}
