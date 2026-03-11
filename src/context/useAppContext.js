import { useContext } from 'react';
import { AppStateContext } from './appState';

export function useAppContext() {
  const context = useContext(AppStateContext);

  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }

  return context;
}
