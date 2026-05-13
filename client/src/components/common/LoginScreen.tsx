import { useState, type FormEvent } from 'react';
import { Eye, EyeOff, Utensils } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '../../context';
import { getAxiosErrorPayload } from '../../utils/errors';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_POLICY_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/;

export function LoginScreen() {
  const { login, register, changePassword } = useAuth();
  const { setCurrentView } = useNavigation();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [isResetMode, setIsResetMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  const switchMode = (nextMode: 'login' | 'register') => {
    setMode(nextMode);
    setIsResetMode(false);
    setErrorMsg('');
    setSuccessMsg('');
  };

  const passwordInputClass =
    'w-full rounded-lg border border-gray-300 px-3 py-2 pr-10 text-sm focus:border-orange-500 focus:outline-none';

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    const normalizedEmail = email.trim().toLowerCase();

    if (!EMAIL_REGEX.test(normalizedEmail)) {
      setErrorMsg('Podaj poprawny adres email.');
      return;
    }

    if (mode === 'register' || isResetMode) {
      const candidatePassword = mode === 'register' ? password : newPassword;

      if (candidatePassword.length < 8 || !PASSWORD_POLICY_REGEX.test(candidatePassword)) {
        setErrorMsg('Hasło musi mieć min. 8 znaków oraz zawierać małą i dużą literę, cyfrę i znak specjalny.');
        return;
      }
    }

    if (isResetMode && password === newPassword) {
      setErrorMsg('Nowe hasło musi różnić się od starego.');
      return;
    }

    if (isResetMode && newPassword !== confirmNewPassword) {
      setErrorMsg('Nowe hasło i powtórzone hasło muszą być takie same.');
      return;
    }

    setLoading(true);

    try {
      if (isResetMode) {
        await changePassword(normalizedEmail, password, newPassword);
        setSuccessMsg('Hasło zostało zmienione. Możesz się teraz zalogować nowym hasłem.');
        setIsResetMode(false);
        setPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
        return;
      }

      const role = mode === 'register' ? await register(normalizedEmail, password) : await login(normalizedEmail, password);

      if (role === 'admin') {
        setCurrentView('admin_dashboard');
      } else if (role === 'waiter') {
        setCurrentView('floor');
      } else {
        setCurrentView('menu');
      }
    } catch (error) {
      const { error: apiError, details } = getAxiosErrorPayload(error);
      setErrorMsg(details || apiError || 'Nie udało się wykonać operacji logowania.');
    } finally {
      setLoading(false);
    }
  };

  const passwordLabel = isResetMode ? 'Stare hasło' : 'Hasło';
  const submitLabel =
    loading ? 'Przetwarzanie...' : isResetMode ? 'Zmień hasło' : mode === 'login' ? 'Zaloguj się' : 'Utwórz konto';

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

        {successMsg && (
          <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
            {successMsg}
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
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500">{passwordLabel}</label>
            <div className="relative">
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type={showPassword ? 'text' : 'password'}
                required
                minLength={mode === 'register' ? 8 : undefined}
                className={passwordInputClass}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Ukryj hasło' : 'Pokaż hasło'}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          {mode === 'login' && !isResetMode && (
            <div className="-mt-2 text-right">
              <button
                type="button"
                onClick={() => {
                  setIsResetMode(true);
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className="text-sm font-medium text-orange-600 hover:text-orange-700"
              >
                Nie pamiętasz hasła?
              </button>
            </div>
          )}
          {isResetMode && (
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500">Nowe hasło</label>
              <div className="relative">
                <input
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  className={passwordInputClass}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword((prev) => !prev)}
                  aria-label={showNewPassword ? 'Ukryj nowe hasło' : 'Pokaż nowe hasło'}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700"
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          )}
          {isResetMode && (
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500">Powtórz nowe hasło</label>
              <div className="relative">
                <input
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  type={showConfirmNewPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  className={passwordInputClass}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmNewPassword((prev) => !prev)}
                  aria-label={showConfirmNewPassword ? 'Ukryj powtórzone hasło' : 'Pokaż powtórzone hasło'}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          )}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => switchMode('login')}
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
              onClick={() => switchMode('register')}
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
            {submitLabel}
          </button>
        </form>
      </div>
    </div>
  );
}
