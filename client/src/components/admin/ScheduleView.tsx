import React, { useState, useEffect } from 'react';
import { CalendarDays, Plus, Minus, Trash2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Schedule } from '../../types';
import { SHIFTS, WAITERS_LIST, INITIAL_SCHEDULE } from '../../constants';

interface ScheduleViewProps {
  role: string | null;
}

export function ScheduleView({ role }: ScheduleViewProps) {
  const { schedule, setSchedule } = useApp();
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (schedule.length === 0) {
      setSchedule(INITIAL_SCHEDULE);
    }
  }, [schedule, setSchedule]);

  const handleAddSchedule = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newEntry: Schedule = {
      id: Date.now().toString(),
      date: formData.get('date') as string,
      shift: formData.get('shift') as string,
      waiter: role === 'waiter' ? 'Jan K. (Ty)' : (formData.get('waiter') as string)
    };
    setSchedule([...schedule, newEntry]);
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    setSchedule(schedule.filter(s => s.id !== id));
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <CalendarDays className="h-6 w-6 text-purple-600" />
          {role === 'admin' ? 'Zarządzanie Grafikami Pracowników' : 'Mój Grafik Dostępności'}
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2"
        >
          {showForm ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {role === 'admin' ? 'Dodaj zmianę' : 'Zgłoś dostępność'}
        </button>
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
                <option key={shift} value={shift}>
                  {shift.includes('Poranna') ? 'Poranna (8:00 - 16:00)' : 'Popołudniowa (16:00 - 00:00)'}
                </option>
              ))}
            </select>
          </div>
          {role === 'admin' && (
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Pracownik</label>
              <select name="waiter" required className="w-full p-2 border border-gray-300 rounded-lg">
                {WAITERS_LIST.map(w => (
                  <option key={w} value={w}>
                    {w}
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
            {schedule.map(s => (
              <tr key={s.id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="p-3 font-medium text-gray-900 whitespace-nowrap">{s.date}</td>
                <td className="p-3 text-gray-700 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-bold ${
                      s.shift.includes('Poranna')
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-indigo-100 text-indigo-800'
                    }`}
                  >
                    {s.shift}
                  </span>
                </td>
                <td className="p-3 font-medium text-gray-800 whitespace-nowrap">{s.waiter}</td>
                {role === 'admin' && (
                  <td className="p-3 text-right">
                    <button onClick={() => handleDelete(s.id)} className="text-red-500 hover:text-red-700 p-1">
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
