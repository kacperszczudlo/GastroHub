import React, { useEffect } from 'react';
import { Clock, Check, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import reservationService from '../../services/reservation.service';

export function AdminReservationsManager() {
  const { reservations, setReservations, tables } = useApp();

  useEffect(() => {
    let mounted = true;

    const fetchReservations = async () => {
      try {
        const items = await reservationService.getAll();
        if (mounted) {
          setReservations(items);
        }
      } catch {
        // Keep current state if API call fails.
      }
    };

    fetchReservations();

    return () => {
      mounted = false;
    };
  }, [setReservations]);

  const handleAccept = (id: string) => {
    const freeTable = tables.find(t => t.status === 'free' || t.status === 'reserved');
    if (freeTable) {
      setReservations(prev =>
        prev.map(r => (r.id === id ? { ...r, status: 'accepted', tableId: freeTable.id } : r))
      );
      alert('Backend nie wspiera jeszcze endpointu accept/reject. Status zaktualizowano lokalnie.');
    } else {
      alert('Brak wolnych stolików w lokalu, zwolnij miejsce na sali.');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await reservationService.delete(id);
      setReservations(prev => prev.filter(r => r.id !== id));
    } catch {
      alert('Nie udało się anulować rezerwacji w backendzie.');
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <Clock className="h-6 w-6 text-purple-600" /> Lista Rezerwacji
      </h2>

      <div className="bg-white shadow-md rounded-xl overflow-x-auto border">
        <table className="min-w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 text-gray-600 text-sm font-bold border-b">
              <th className="p-3 whitespace-nowrap">Klient</th>
              <th className="p-3 whitespace-nowrap">Data i Czas</th>
              <th className="p-3 whitespace-nowrap">Osoby</th>
              <th className="p-3 whitespace-nowrap">Stolik</th>
              <th className="p-3 whitespace-nowrap">Status</th>
              <th className="p-3 whitespace-nowrap text-right">Akcje</th>
            </tr>
          </thead>
          <tbody>
            {reservations.map(res => (
              <tr key={res.id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="p-3 font-medium text-gray-900 whitespace-nowrap">{res.clientName}</td>
                <td className="p-3 text-gray-700 whitespace-nowrap">
                  {res.date} <span className="font-bold">{res.time}</span>
                </td>
                <td className="p-3 text-gray-700 whitespace-nowrap">{res.guests}</td>
                <td className="p-3 font-bold text-gray-800 whitespace-nowrap">
                  {res.tableId ? `#${tables.find(t => t.id === res.tableId)?.number}` : '-'}
                </td>
                <td className="p-3 whitespace-nowrap">
                  {res.status === 'pending' ? (
                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-bold">
                      Oczekująca
                    </span>
                  ) : (
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-bold">
                      Zatwierdzona
                    </span>
                  )}
                </td>
                <td className="p-3 text-right whitespace-nowrap">
                  <div className="flex justify-end gap-1">
                    {res.status === 'pending' && (
                      <button
                        onClick={() => handleAccept(res.id)}
                        className="bg-green-500 hover:bg-green-600 text-white p-1 rounded"
                        title="Akceptuj"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleReject(res.id)}
                      className="bg-red-500 hover:bg-red-600 text-white p-1 rounded"
                      title="Odrzuć/Usuń"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {reservations.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-gray-500">
                  Brak aktywnych rezerwacji.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
