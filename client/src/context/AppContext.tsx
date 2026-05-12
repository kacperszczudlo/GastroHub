import { createContext, useContext, useState, type Dispatch, type ReactNode, type SetStateAction } from 'react';
import type { Table, Reservation, MenuItem, Schedule, ViewType } from '../types';

type SetState<T> = Dispatch<SetStateAction<T>>;

interface AppContextType {
  currentView: ViewType;
  setCurrentView: SetState<ViewType>;
  
  tables: Table[];
  setTables: SetState<Table[]>;
  
  menu: MenuItem[];
  setMenu: SetState<MenuItem[]>;
  
  reservations: Reservation[];
  setReservations: SetState<Reservation[]>;
  
  schedule: Schedule[];
  setSchedule: SetState<Schedule[]>;
  
  selectedTable: Table | null;
  setSelectedTable: (table: Table | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentView, setCurrentView] = useState<ViewType>('menu');
  const [tables, setTables] = useState<Table[]>([]);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [schedule, setSchedule] = useState<Schedule[]>([]);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);

  return (
    <AppContext.Provider
      value={{
        currentView,
        setCurrentView,
        tables,
        setTables,
        menu,
        setMenu,
        reservations,
        setReservations,
        schedule,
        setSchedule,
        selectedTable,
        setSelectedTable
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
