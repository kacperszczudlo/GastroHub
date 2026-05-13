import { createContext, useContext, useState, type Dispatch, type ReactNode, type SetStateAction } from 'react';
import type { ViewType } from '../types';

type SetState<T> = Dispatch<SetStateAction<T>>;

interface NavigationContextValue {
  currentView: ViewType;
  setCurrentView: SetState<ViewType>;
}

const NavigationContext = createContext<NavigationContextValue | undefined>(undefined);

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [currentView, setCurrentView] = useState<ViewType>('menu');

  return (
    <NavigationContext.Provider value={{ currentView, setCurrentView }}>{children}</NavigationContext.Provider>
  );
}

export function useNavigation() {
  const ctx = useContext(NavigationContext);
  if (!ctx) {
    throw new Error('useNavigation must be used within NavigationProvider');
  }
  return ctx;
}
