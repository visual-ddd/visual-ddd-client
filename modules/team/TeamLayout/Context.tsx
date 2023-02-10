import { createContext, useContext } from 'react';
import { TeamLayoutModel } from './TeamLayoutModel';

const CONTEXT = createContext<TeamLayoutModel | undefined>(undefined);

export const TeamLayoutProvider = CONTEXT.Provider;

export function useTeamLayoutModel() {
  return useContext(CONTEXT);
}
