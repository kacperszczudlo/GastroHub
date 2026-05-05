import React, { createContext, useContext, useState } from 'react';
import type { Table, Reservation, MenuItem, Schedule } from '../types';

type SetState<T> = React.Dispatch<React.SetStateAction<T>>;

interface AppContextType {
  currentView: string;
  setCurrentView: (view: string) => void;
  
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

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentView, setCurrentView] = useState<string>('menu');
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
