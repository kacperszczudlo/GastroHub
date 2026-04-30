import React from 'react';
import { Utensils, LogOut, MapPin, Phone } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';

export function Header() {
  const { role, logout } = useAuth();
  const { currentView, setCurrentView } = useApp();

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Utensils className="h-8 w-8 text-orange-500" />
          <span className="font-bold text-2xl text-gray-900 tracking-tight">
            Gastro<span className="text-orange-500">Hub</span>
          </span>
        </div>

        {role && (
          <div className="hidden md:flex items-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" /> ul. Rynek 1, Kraków
            </div>
            <div className="flex items-center gap-1">
              <Phone className="h-4 w-4" /> +48 123 456 789
            </div>
          </div>
        )}

        <div className="flex items-center gap-4">
          {role && (
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-gray-100 rounded-full text-sm font-medium text-gray-800 capitalize">
                Zalogowano jako: {role === 'client' ? 'Klient' : role === 'waiter' ? 'Kelner' : 'Administrator'}
              </span>
              <button
                onClick={() => {
                  logout();
                  setCurrentView('menu');
                }}
                className="flex items-center gap-1 text-red-600 hover:bg-red-50 px-3 py-1 rounded-md transition"
              >
                <LogOut className="h-4 w-4" /> Wyloguj
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Navigation bars */}
      {role === 'client' && (
        <nav className="bg-gray-50 border-b flex justify-center gap-8 py-3 overflow-x-auto px-4">
          <NavButton
            active={currentView === 'menu'}
            onClick={() => setCurrentView('menu')}
          >
            Menu Restauracji
          </NavButton>
          <NavButton
            active={currentView === 'reservation'}
            onClick={() => setCurrentView('reservation')}
          >
            Rezerwuj Stolik
          </NavButton>
          <NavButton
            active={currentView === 'client_reservations'}
            onClick={() => setCurrentView('client_reservations')}
          >
            Moje Rezerwacje
          </NavButton>
        </nav>
      )}

      {role === 'waiter' && (
        <nav className="bg-gray-800 text-white flex justify-center gap-8 py-3 overflow-x-auto px-4">
          <NavButton
            active={currentView === 'floor'}
            onClick={() => setCurrentView('floor')}
            theme="dark"
          >
            Sala & Stoliki
          </NavButton>
          <NavButton
            active={currentView === 'pos'}
            onClick={() => setCurrentView('pos')}
            theme="dark"
          >
            System POS
          </NavButton>
          <NavButton
            active={currentView === 'schedule'}
            onClick={() => setCurrentView('schedule')}
            theme="dark"
          >
            Mój Grafik
          </NavButton>
        </nav>
      )}

      {role === 'admin' && (
        <nav className="bg-purple-900 text-white flex justify-center gap-6 py-3 overflow-x-auto px-4">
          <NavButton
            active={currentView === 'admin_dashboard'}
            onClick={() => setCurrentView('admin_dashboard')}
            theme="dark"
          >
            Układ Sali
          </NavButton>
          <NavButton
            active={currentView === 'admin_reservations'}
            onClick={() => setCurrentView('admin_reservations')}
            theme="dark"
          >
            Rezerwacje
          </NavButton>
          <NavButton
            active={currentView === 'schedule'}
            onClick={() => setCurrentView('schedule')}
            theme="dark"
          >
            Grafiki Pracy
          </NavButton>
          <NavButton
            active={currentView === 'admin_menu'}
            onClick={() => setCurrentView('admin_menu')}
            theme="dark"
          >
            Menu (CRUD)
          </NavButton>
        </nav>
      )}
    </header>
  );
}

interface NavButtonProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  theme?: 'light' | 'dark';
}

function NavButton({ active, onClick, children, theme = 'light' }: NavButtonProps) {
  if (theme === 'dark') {
    return (
      <button
        onClick={onClick}
        className={`font-medium whitespace-nowrap px-2 ${
          active ? 'text-orange-400' : 'text-gray-300 hover:text-white'
        }`}
      >
        {children}
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className={`font-medium whitespace-nowrap px-2 ${
        active
          ? 'text-orange-600 border-b-2 border-orange-600'
          : 'text-gray-600 hover:text-orange-500'
      }`}
    >
      {children}
    </button>
  );
}
