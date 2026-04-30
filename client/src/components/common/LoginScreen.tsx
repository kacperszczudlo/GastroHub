import React from 'react';
import { Utensils, Users, ShoppingCart, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';

export function LoginScreen() {
  const { login } = useAuth();
  const { setCurrentView } = useApp();
  const [loadingRole, setLoadingRole] = React.useState<string | null>(null);
  const [errorMsg, setErrorMsg] = React.useState<string>('');

  const handleLogin = async (role: 'client' | 'waiter' | 'admin') => {
    setErrorMsg('');
    setLoadingRole(role);
    try {
      await login(role);
      if (role === 'client') setCurrentView('menu');
      if (role === 'waiter') setCurrentView('floor');
      if (role === 'admin') setCurrentView('admin_dashboard');
    } catch {
      setErrorMsg('Nie udało się zalogować do backendu. Sprawdź czy serwer API działa.');
    } finally {
      setLoadingRole(null);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md text-center">
        <Utensils className="h-16 w-16 text-orange-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Witamy w GastroHub</h1>
        <p className="text-gray-500 mb-8">Wybierz rolę, aby przetestować system wizualizacji.</p>

        {errorMsg && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {errorMsg}
          </div>
        )}

        <div className="space-y-4">
          <button
            onClick={() => handleLogin('client')}
            disabled={loadingRole !== null}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-xl shadow-md transition flex items-center justify-center gap-2"
          >
            <Users className="h-5 w-5" />
            {loadingRole === 'client' ? 'Logowanie...' : 'Zaloguj jako Klient'}
          </button>
          <button
            onClick={() => handleLogin('waiter')}
            disabled={loadingRole !== null}
            className="w-full bg-gray-800 hover:bg-gray-900 text-white font-bold py-3 px-4 rounded-xl shadow-md transition flex items-center justify-center gap-2"
          >
            <ShoppingCart className="h-5 w-5" />
            {loadingRole === 'waiter' ? 'Logowanie...' : 'Zaloguj jako Kelner'}
          </button>
          <button
            onClick={() => handleLogin('admin')}
            disabled={loadingRole !== null}
            className="w-full bg-purple-700 hover:bg-purple-800 text-white font-bold py-3 px-4 rounded-xl shadow-md transition flex items-center justify-center gap-2"
          >
            <LayoutDashboard className="h-5 w-5" />
            {loadingRole === 'admin' ? 'Logowanie...' : 'Zaloguj jako Administrator'}
          </button>
        </div>
      </div>
    </div>
  );
}
