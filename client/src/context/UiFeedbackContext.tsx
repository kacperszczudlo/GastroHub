import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

type NotificationType = 'success' | 'error';

type Notification = {
  id: string;
  type: NotificationType;
  message: string;
};

type ConfirmState = {
  title: string;
  message: string;
  resolve: (value: boolean) => void;
} | null;

type UiFeedbackContextValue = {
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  confirm: (title: string, message: string) => Promise<boolean>;
};

const UiFeedbackContext = createContext<UiFeedbackContextValue | undefined>(undefined);

export function UiFeedbackProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [confirmState, setConfirmState] = useState<ConfirmState>(null);
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(item => item.id !== id));
    if (timers.current[id]) {
      clearTimeout(timers.current[id]);
      delete timers.current[id];
    }
  }, []);

  const show = useCallback((type: NotificationType, message: string) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setNotifications(prev => [...prev, { id, type, message }]);
    timers.current[id] = setTimeout(() => removeNotification(id), 4000);
  }, [removeNotification]);

  const showSuccess = useCallback((message: string) => show('success', message), [show]);
  const showError = useCallback((message: string) => show('error', message), [show]);

  const confirm = useCallback((title: string, message: string) => {
    return new Promise<boolean>((resolve) => {
      setConfirmState({ title, message, resolve });
    });
  }, []);

  const closeConfirm = useCallback((value: boolean) => {
    setConfirmState(prev => {
      if (prev) {
        prev.resolve(value);
      }
      return null;
    });
  }, []);

  const value = useMemo<UiFeedbackContextValue>(() => ({
    showSuccess,
    showError,
    confirm
  }), [showSuccess, showError, confirm]);

  return (
    <UiFeedbackContext.Provider value={value}>
      {children}

      <div className="fixed top-4 right-4 z-[100] space-y-2">
        {notifications.map(item => (
          <div
            key={item.id}
            className={`min-w-[280px] max-w-sm rounded-lg border px-3 py-2 shadow-lg text-sm flex items-start gap-2 ${
              item.type === 'success'
                ? 'bg-green-50 border-green-200 text-green-800'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            {item.type === 'success' ? (
              <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            )}
            <p className="flex-1">{item.message}</p>
            <button
              type="button"
              aria-label="Zamknij powiadomienie"
              onClick={() => removeNotification(item.id)}
              className="opacity-70 hover:opacity-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      {confirmState && (
        <div className="fixed inset-0 z-[120] bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-gray-900">{confirmState.title}</h3>
            <p className="mt-2 text-sm text-gray-600">{confirmState.message}</p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => closeConfirm(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                Anuluj
              </button>
              <button
                type="button"
                onClick={() => closeConfirm(true)}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
              >
                Potwierdź
              </button>
            </div>
          </div>
        </div>
      )}
    </UiFeedbackContext.Provider>
  );
}

export function useUiFeedback() {
  const context = useContext(UiFeedbackContext);
  if (!context) {
    throw new Error('useUiFeedback must be used within UiFeedbackProvider');
  }
  return context;
}
