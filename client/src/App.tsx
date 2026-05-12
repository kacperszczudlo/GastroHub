import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider, useApp } from './context/AppContext';
import { UiFeedbackProvider } from './context/UiFeedbackContext';
import { Header, LoginScreen } from './components/common';
import { ClientMenu, ClientReservation, ClientReservationsList } from './components/client';
import { WaiterPOS, FloorPlan, TableModal } from './components/waiter';
import { AdminReservationsManager, AdminMenuManager, ScheduleView } from './components/admin';

function AppContent() {
  const { role } = useAuth();
  const { currentView } = useApp();

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <Header />

      {!role ? (
        <LoginScreen />
      ) : (
        <main className="pb-10">
          {role === 'client' && currentView === 'menu' && <ClientMenu />}
          {role === 'client' && currentView === 'reservation' && <ClientReservation />}
          {role === 'client' && currentView === 'client_reservations' && <ClientReservationsList />}

          {role === 'waiter' && currentView === 'pos' && <WaiterPOS />}
          {role === 'waiter' && currentView === 'floor' && <FloorPlan editable={false} />}
          {role === 'waiter' && currentView === 'schedule' && <ScheduleView role={role} />}

          {role === 'admin' && currentView === 'admin_dashboard' && <FloorPlan editable={true} />}
          {role === 'admin' && currentView === 'admin_reservations' && <AdminReservationsManager />}
          {role === 'admin' && currentView === 'schedule' && <ScheduleView role={role} />}
          {role === 'admin' && currentView === 'admin_menu' && <AdminMenuManager />}
        </main>
      )}

      <TableModal role={role} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <UiFeedbackProvider>
        <AppProvider>
          <AppContent />
        </AppProvider>
      </UiFeedbackProvider>
    </AuthProvider>
  );
}
