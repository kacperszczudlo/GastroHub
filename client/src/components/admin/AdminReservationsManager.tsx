import React, { useEffect } from 'react';
import { Clock, Check, X, Trash2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useUiFeedback } from '../../context/UiFeedbackContext';
import reservationService from '../../services/reservation.service';
import tableService from '../../services/table.service';

export function AdminReservationsManager() {
  const { reservations, setReservations, tables, setTables } = useApp();
  const { showSuccess, showError, confirm } = useUiFeedback();

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

  const handleAccept = async (id: string) => {
    try {
      const updated = await reservationService.update(id, { status: 'accepted' });
      setReservations(prev => prev.map(r => (r.id === id ? updated : r)));
      // Pobierz świeże tabele (rezerwacja przypisuje stolik)
      const tables = await tableService.getAll();
      setTables(tables);
    } catch {
      showError('Nie udało się zaakceptować rezerwacji.');
    }
  };

  const handleReject = async (id: string) => {
    try {
      const reservation = reservations.find(r => r.id === id);
      if (!reservation) return;

      const nextStatus = reservation.status === 'accepted' ? 'cancelled' : 'rejected';
      const updated = await reservationService.update(id, { status: nextStatus });
      setReservations(prev => prev.map(r => (r.id === id ? updated : r)));
      // Pobierz świeże tabele (zwolniony stolik)
      const tables = await tableService.getAll();
      setTables(tables);
    } catch {
      showError('Nie udało się anulować rezerwacji.');
    }
  };

  const handleHardDelete = async (id: string) => {
    const shouldDelete = await confirm(
      'Usunąć rezerwację?',
      'Na pewno chcesz trwale usunąć tę rezerwację? To działanie jest nieodwracalne.'
    );
    if (!shouldDelete) return;
    try {
      await reservationService.hardDelete(id);
      setReservations(prev => prev.filter(r => r.id !== id));
      showSuccess('Rezerwacja została trwale usunięta.');
    } catch {
      showError('Nie udało się trwale usunąć rezerwacji.');
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Clock className="h-6 w-6 text-purple-600" /> Lista Rezerwacji
        </h2>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              const shouldPrune = await confirm(
                'Usunąć stare rezerwacje?',
                'Usunąć wszystkie anulowane rezerwacje starsze niż 90 dni?'
              );
              if (!shouldPrune) return;
              try {
                await reservationService.prune(90);
                const items = await reservationService.getAll();
                setReservations(items);
                showSuccess('Stare rezerwacje zostały usunięte.');
              } catch {
                showError('Nie udało się usunąć starych rezerwacji.');
              }
            }}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-2 rounded"
          >
            Prune (usuń stare)
          </button>
        </div>
      </div>

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
                  ) : res.status === 'accepted' ? (
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-bold">
                      Zatwierdzona
                    </span>
                  ) : res.status === 'active' ? (
                    <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-bold">
                      Klient na miejscu
                    </span>
                  ) : res.status === 'completed' ? (
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-bold">
                      Zrealizowana
                    </span>
                  ) : res.status === 'cancelled' ? (
                    <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-bold">
                      Anulowana
                    </span>
                  ) : (
                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-bold">
                      Odrzucona
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
                      title="Odrzuć/Anuluj"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleHardDelete(res.id)}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-700 p-1 rounded"
                      title="Usuń trwale"
                    >
                      <Trash2 className="h-4 w-4" />
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
