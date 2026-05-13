import { createContext, useContext, useState, type Dispatch, type ReactNode, type SetStateAction } from 'react';
import type { Schedule } from '../types';

type SetState<T> = Dispatch<SetStateAction<T>>;

interface ScheduleContextValue {
  schedule: Schedule[];
  setSchedule: SetState<Schedule[]>;
}

const ScheduleContext = createContext<ScheduleContextValue | undefined>(undefined);

export function ScheduleProvider({ children }: { children: ReactNode }) {
  const [schedule, setSchedule] = useState<Schedule[]>([]);

  return (
    <ScheduleContext.Provider value={{ schedule, setSchedule }}>{children}</ScheduleContext.Provider>
  );
}

export function useSchedule() {
  const ctx = useContext(ScheduleContext);
  if (!ctx) {
    throw new Error('useSchedule must be used within ScheduleProvider');
  }
  return ctx;
}
