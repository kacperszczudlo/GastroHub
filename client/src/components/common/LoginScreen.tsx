import React from 'react';
import { Utensils } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_POLICY_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/;

export function LoginScreen() {
  const { login, register } = useAuth();
  const { setCurrentView } = useApp();
  const [mode, setMode] = React.useState<'login' | 'register'>('login');
  const [loading, setLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string>('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMsg('');
    const normalizedEmail = email.trim().toLowerCase();

    if (mode === 'register') {
      if (!EMAIL_REGEX.test(normalizedEmail)) {
        setErrorMsg('Podaj poprawny adres email.');
        return;
      }

      if (password.length < 8 || !PASSWORD_POLICY_REGEX.test(password)) {
        setErrorMsg('Hasło musi mieć min. 8 znaków oraz zawierać małą i dużą literę, cyfrę i znak specjalny.');
        return;
      }
    }

    setLoading(true);

    try {
      const role = mode === 'register' ? await register(normalizedEmail, password) : await login(normalizedEmail, password);

      if (role === 'admin') {
        setCurrentView('admin_dashboard');
      } else if (role === 'waiter') {
        setCurrentView('floor');
      } else {
        setCurrentView('menu');
      }
    } catch (error: any) {
      setErrorMsg(error.response?.data?.error || 'Nie udało się wykonać operacji logowania.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md text-center">
        <Utensils className="h-16 w-16 text-orange-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Witamy w GastroHub</h1>
        <p className="text-gray-500 mb-8">Zaloguj się lub utwórz konto klienta.</p>

        {errorMsg && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {errorMsg}
          </div>
        )}

        <form className="space-y-4 text-left" onSubmit={handleSubmit}>
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500">Hasło</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
              minLength={8}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`rounded-lg px-3 py-2 text-sm font-semibold border ${
                mode === 'login'
                  ? 'bg-orange-600 text-white border-orange-600'
                  : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-100'
              }`}
            >
              Logowanie
            </button>
            <button
              type="button"
              onClick={() => setMode('register')}
              className={`rounded-lg px-3 py-2 text-sm font-semibold border ${
                mode === 'register'
                  ? 'bg-orange-600 text-white border-orange-600'
                  : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-100'
              }`}
            >
              Rejestracja
            </button>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gray-900 hover:bg-black text-white font-bold py-3 px-4 rounded-xl shadow-md transition"
          >
            {loading ? 'Przetwarzanie...' : mode === 'login' ? 'Zaloguj się' : 'Utwórz konto'}
          </button>
        </form>
      </div>
    </div>
  );
}
