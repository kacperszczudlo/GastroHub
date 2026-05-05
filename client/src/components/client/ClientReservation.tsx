import React from 'react';
import { Calendar } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import reservationService from '../../services/reservation.service';

export function ClientReservation() {
  const { setReservations } = useApp();
  const { email: currentUserEmail } = useAuth();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newRes = {
      id: Date.now().toString(),
      date: formData.get('date') as string,
      time: formData.get('time') as string,
      guests: parseInt(formData.get('guests') as string),
      status: 'pending' as const,
      tableId: null,
      clientName: currentUserEmail || 'Klient'
    };

    try {
      const created = await reservationService.create(newRes);
      setReservations(prev => [...prev, created]);
      alert('Rezerwacja została wysłana do backendu.');
    } catch {
      alert('Nie udało się wysłać rezerwacji do backendu.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 mt-10">
      <div className="bg-white p-8 rounded-2xl shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <Calendar className="h-8 w-8 text-orange-500" />
          <h2 className="text-2xl font-bold text-gray-800">Zarezerwuj stolik</h2>
        </div>
        <p className="text-gray-600 mb-6 bg-blue-50 p-4 rounded-lg border border-blue-100 text-sm">
          Wybierz termin. Po wysłaniu formularza, nasza obsługa zweryfikuje dostępność i potwierdzi
          rezerwację przypisując stolik.
        </p>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
              <input
                name="date"
                type="date"
                required
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Godzina</label>
              <input
                name="time"
                type="time"
                required
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Liczba gości</label>
            <select
              name="guests"
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                <option key={n} value={n}>
                  {n} {n === 1 ? 'osoba' : n < 5 ? 'osoby' : 'osób'}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-xl shadow-md transition mt-4 text-lg"
          >
            Wyślij prośbę o rezerwację
          </button>
        </form>
      </div>
    </div>
  );
}
