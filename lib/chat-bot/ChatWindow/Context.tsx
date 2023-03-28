import { createContext, useContext, useMemo } from 'react';
import { BotModel } from '../BotModel';

const CONTEXT = createContext<BotModel | null>(null);

export function useBotContext() {
  const context = useContext(CONTEXT);
  if (!context) {
    throw new Error('useBotContext must be used inside a BotProvider');
  }

  return context;
}

export interface BotProviderProps {
  bot?: BotModel;
  children: React.ReactNode;
}

export function BotProvider({ bot, children }: BotProviderProps) {
  const model = useMemo(() => {
    return bot || new BotModel();
  }, [bot]);

  return <CONTEXT.Provider value={model}>{children}</CONTEXT.Provider>;
}
