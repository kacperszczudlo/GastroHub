import { useState, useEffect, type FormEvent } from 'react';
import { CalendarDays, Plus, Minus, Trash2 } from 'lucide-react';
import { useSchedule } from '../../context';
import { useAuth } from '../../context/AuthContext';
import type { Schedule, UserRole } from '../../types';
import { SHIFTS } from '../../constants';
import authService from '../../services/auth.service';
import scheduleService from '../../services/schedule.service';
import { getAxiosErrorPayload } from '../../utils/errors';

interface ScheduleViewProps {
  role: UserRole;
}

interface Waiter {
  _id: string;
  email: string;
}

export function ScheduleView({ role }: ScheduleViewProps) {
  const { schedule, setSchedule } = useSchedule();
  const { email: currentUserEmail } = useAuth();
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [waiters, setWaiters] = useState<Waiter[]>([]);
  const [loadingWaiters, setLoadingWaiters] = useState(false);

  useEffect(() => {
    const loadSchedules = async () => {
      try {
        if (role === 'admin') {
          const all = await scheduleService.getAll();
          setSchedule(all);
        } else if (role === 'waiter' && currentUserEmail) {
          const waiterSchedules = await scheduleService.getByWaiter(currentUserEmail);
          setSchedule(waiterSchedules);
        }
      } catch (err) {
        console.error('Błąd ładowania grafiów:', err);
      }
    };
    loadSchedules();
  }, [role, currentUserEmail, setSchedule]);

  useEffect(() => {
    if (role === 'admin') {
      setLoadingWaiters(true);
      authService.getWaiters()
        .then(list => {
          setWaiters(list);
        })
        .catch(err => {
          console.error('Błąd podczas pobierania kelnerów:', err);
        })
        .finally(() => {
          setLoadingWaiters(false);
        });
    }
  }, [role]);

  const handleAddSchedule = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    
    try {
      const formData = new FormData(e.currentTarget);
      const shiftKey = formData.get('shift') as string;
      const dateValue = formData.get('date') as string;
      const newSchedule = {
        date: new Date(dateValue).toISOString(),
        shift: shiftKey as 'morning' | 'afternoon' | 'evening',
        waiter: role === 'waiter' ? (currentUserEmail || '') : (formData.get('waiter') as string)
      };

      if (!newSchedule.waiter) {
        setError('Brak wybranego pracownika');
        return;
      }

      await scheduleService.create(newSchedule);
      
      const updated = role === 'admin' 
        ? await scheduleService.getAll()
        : await scheduleService.getByWaiter(newSchedule.waiter);
      
      setSchedule(updated);
      setShowForm(false);
    } catch (err) {
      const { error, details, status } = getAxiosErrorPayload(err);
      if (status >= 500 || status === 0) console.error('Błąd dodawania grafiku:', err);
      setError(details || error || 'Nie udało się dodać grafiku');
    }
  };

  const getShiftLabel = (shiftKey: string) => {
    const shift = SHIFTS.find(s => s.key === shiftKey);
    return shift?.label || shiftKey;
  };

  const sortedSchedule = [...schedule].sort((a, b) => {
    const diff = new Date(b.date).getTime() - new Date(a.date).getTime();
    return sortOrder === 'newest' ? diff : -diff;
  });

  const handleDelete = async (id: string) => {
    try {
      if (!id) throw new Error('Brak id grafiku');
      await scheduleService.delete(id);
      
      const updated = role === 'admin'
        ? await scheduleService.getAll()
        : await scheduleService.getByWaiter(currentUserEmail || '');
      
      setSchedule(updated);
    } catch (err) {
      const { error, details, status } = getAxiosErrorPayload(err);
      if (status >= 500 || status === 0) console.error('Błąd usuwania grafiku:', err);
      setError(details || error || 'Nie udało się usunąć grafiku');
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <CalendarDays className="h-6 w-6 text-purple-600" />
          {role === 'admin' ? 'Zarządzanie Grafikami Pracowników' : 'Mój Grafik Dostępności'}
        </h2>
        <div className="flex items-center gap-2">
          <select
            value={sortOrder}
            onChange={e => setSortOrder(e.target.value as 'newest' | 'oldest')}
            className="px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 bg-white"
            aria-label="Sortowanie grafiku"
          >
            <option value="newest">Najnowsze</option>
            <option value="oldest">Najstarsze</option>
          </select>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2"
          >
            {showForm ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {role === 'admin' ? 'Dodaj zmianę' : 'Zgłoś dostępność'}
          </button>
        </div>
      </div>

      {showForm && (
        <form
          onSubmit={handleAddSchedule}
          className="bg-white p-4 rounded-xl shadow-md border mb-6 flex gap-4 items-end bg-orange-50 transition-all"
        >
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
            <input name="date" type="date" required className="w-full p-2 border border-gray-300 rounded-lg" />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Zmiana</label>
            <select name="shift" required className="w-full p-2 border border-gray-300 rounded-lg">
              {SHIFTS.map(shift => (
                <option key={shift.key} value={shift.key}>
                  {shift.label}
                </option>
              ))}
            </select>
          </div>
          {role === 'admin' && (
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Pracownik</label>
              <select name="waiter" required className="w-full p-2 border border-gray-300 rounded-lg" disabled={loadingWaiters}>
                <option value="">-- Wybierz pracownika --</option>
                {waiters.map(w => (
                  <option key={w._id} value={w.email}>
                    {w.email}
                  </option>
                ))}
              </select>
            </div>
          )}
          <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium h-[42px]">
            Zapisz
          </button>
        </form>
      )}

      <div className="bg-white shadow-md rounded-xl overflow-x-auto border">
        <table className="min-w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 text-gray-600 text-sm font-bold border-b">
              <th className="p-3 whitespace-nowrap">Data</th>
              <th className="p-3 whitespace-nowrap">Zmiana</th>
              <th className="p-3 whitespace-nowrap">Pracownik</th>
              {role === 'admin' && <th className="p-3 whitespace-nowrap text-right">Akcje</th>}
            </tr>
          </thead>
          <tbody>
            {sortedSchedule.map(s => (
                <tr key={s._id || s.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="p-3 font-medium text-gray-900 whitespace-nowrap">{new Date(s.date).toLocaleDateString()}</td>
                <td className="p-3 text-gray-700 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-bold ${
                      s.shift === 'morning'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-indigo-100 text-indigo-800'
                    }`}
                  >
                    {getShiftLabel(s.shift)}
                  </span>
                </td>
                <td className="p-3 font-medium text-gray-800 whitespace-nowrap">{s.waiter}</td>
                {role === 'admin' && (
                  <td className="p-3 text-right">
                    <button onClick={() => handleDelete(s._id || s.id)} className="text-red-500 hover:text-red-700 p-1">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                )}
              </tr>
            ))}
            {schedule.length === 0 && (
              <tr>
                <td colSpan={role === 'admin' ? 4 : 3} className="p-6 text-center text-gray-500">
                  Brak wpisów w grafiku.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
