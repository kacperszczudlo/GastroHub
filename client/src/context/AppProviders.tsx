import type { ReactNode } from 'react';
import { NavigationProvider } from './NavigationContext';
import { MenuDataProvider } from './MenuDataContext';
import { TablesProvider } from './TablesContext';
import { ReservationsProvider } from './ReservationsContext';
import { ScheduleProvider } from './ScheduleContext';

export function AppProvider({ children }: { children: ReactNode }) {
  return (
    <NavigationProvider>
      <MenuDataProvider>
        <TablesProvider>
          <ReservationsProvider>
            <ScheduleProvider>{children}</ScheduleProvider>
          </ReservationsProvider>
        </TablesProvider>
      </MenuDataProvider>
    </NavigationProvider>
  );
}
