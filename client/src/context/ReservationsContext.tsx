import { createContext, useContext, useState, type Dispatch, type ReactNode, type SetStateAction } from 'react';
import type { Reservation } from '../types';

type SetState<T> = Dispatch<SetStateAction<T>>;

interface ReservationsContextValue {
  reservations: Reservation[];
  setReservations: SetState<Reservation[]>;
}

const ReservationsContext = createContext<ReservationsContextValue | undefined>(undefined);

export function ReservationsProvider({ children }: { children: ReactNode }) {
  const [reservations, setReservations] = useState<Reservation[]>([]);

  return (
    <ReservationsContext.Provider value={{ reservations, setReservations }}>
      {children}
    </ReservationsContext.Provider>
  );
}

export function useReservations() {
  const ctx = useContext(ReservationsContext);
  if (!ctx) {
    throw new Error('useReservations must be used within ReservationsProvider');
  }
  return ctx;
}
