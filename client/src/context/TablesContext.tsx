import { createContext, useContext, useState, type Dispatch, type ReactNode, type SetStateAction } from 'react';
import type { Table } from '../types';

type SetState<T> = Dispatch<SetStateAction<T>>;

interface TablesContextValue {
  tables: Table[];
  setTables: SetState<Table[]>;
  selectedTable: Table | null;
  setSelectedTable: (table: Table | null) => void;
}

const TablesContext = createContext<TablesContextValue | undefined>(undefined);

export function TablesProvider({ children }: { children: ReactNode }) {
  const [tables, setTables] = useState<Table[]>([]);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);

  return (
    <TablesContext.Provider value={{ tables, setTables, selectedTable, setSelectedTable }}>
      {children}
    </TablesContext.Provider>
  );
}

export function useTables() {
  const ctx = useContext(TablesContext);
  if (!ctx) {
    throw new Error('useTables must be used within TablesProvider');
  }
  return ctx;
}
