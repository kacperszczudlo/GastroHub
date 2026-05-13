import { createContext, useContext, useState, type Dispatch, type ReactNode, type SetStateAction } from 'react';
import type { MenuItem } from '../types';

type SetState<T> = Dispatch<SetStateAction<T>>;

interface MenuDataContextValue {
  menu: MenuItem[];
  setMenu: SetState<MenuItem[]>;
}

const MenuDataContext = createContext<MenuDataContextValue | undefined>(undefined);

export function MenuDataProvider({ children }: { children: ReactNode }) {
  const [menu, setMenu] = useState<MenuItem[]>([]);

  return <MenuDataContext.Provider value={{ menu, setMenu }}>{children}</MenuDataContext.Provider>;
}

export function useMenuData() {
  const ctx = useContext(MenuDataContext);
  if (!ctx) {
    throw new Error('useMenuData must be used within MenuDataProvider');
  }
  return ctx;
}
