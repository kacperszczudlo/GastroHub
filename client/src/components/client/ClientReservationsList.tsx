import { useEffect, useState } from 'react';
import { CalendarDays, Users, CheckCircle, Clock, XCircle } from 'lucide-react';
import { useReservations, useTables } from '../../context';
import { useAuth } from '../../context/AuthContext';
import reservationService from '../../services/reservation.service';

export function ClientReservationsList() {
  const { reservations, setReservations } = useReservations();
  const { tables } = useTables();
  const { role } = useAuth();
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  useEffect(() => {
    if (!role) return;
    let mounted = true;

    const fetchReservations = async () => {
      try {
        const allReservations = await reservationService.getMine();
        if (mounted) {
          setReservations(allReservations);
        }
      } catch {
        void 0;
      }
    };

    fetchReservations();

    return () => {
      mounted = false;
    };
  }, [role, setReservations]);

  const parseReservationDateTime = (date: string, time: string) => {
    const timestamp = new Date(`${date}T${time}`).getTime();
    return Number.isNaN(timestamp) ? 0 : timestamp;
  };

  const myReservations = [...reservations].sort((a, b) => {
    const diff = parseReservationDateTime(b.date, b.time) - parseReservationDateTime(a.date, a.time);
    return sortOrder === 'newest' ? diff : -diff;
  });

  return (
    <div className="max-w-4xl mx-auto p-6 mt-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
          <CalendarDays className="h-8 w-8 text-orange-500" /> Moje Rezerwacje
        </h2>
        <select
          value={sortOrder}
          onChange={e => setSortOrder(e.target.value as 'newest' | 'oldest')}
          className="px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 bg-white"
          aria-label="Sortowanie moich rezerwacji"
        >
          <option value="newest">Najnowsze</option>
          <option value="oldest">Najstarsze</option>
        </select>
      </div>
      {myReservations.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl shadow-sm text-center text-gray-500 border border-gray-100">
          Nie masz jeszcze żadnych rezerwacji.
        </div>
      ) : (
        <div className="space-y-4">
          {myReservations.map(res => (
            <div
              key={res.id}
              className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center"
            >
              <div>
                <div className="text-lg font-bold text-gray-800">
                  {res.date} <span className="text-gray-500 font-normal">o godzinie</span> {res.time}
                </div>
                <div className="text-gray-600 mt-1 flex items-center gap-2">
                  <Users className="h-4 w-4" /> {res.guests} os.
                  {res.tableId && (
                    <span className="ml-2 px-2 py-0.5 bg-gray-100 rounded text-sm font-medium">
                      Stolik #{tables.find(t => t.id === res.tableId)?.number}
                    </span>
                  )}
                </div>
              </div>
              <div>
                {res.status === 'pending' ? (
                  <span className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2">
                    <Clock className="h-4 w-4" /> Oczekuje na potwierdzenie
                  </span>
                ) : res.status === 'accepted' ? (
                  <span className="bg-green-100 text-green-800 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" /> Potwierdzona
                  </span>
                ) : res.status === 'cancelled' ? (
                  <span className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2">
                    <XCircle className="h-4 w-4" /> Anulowana
                  </span>
                ) : (
                  <span className="bg-red-100 text-red-800 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2">
                    <XCircle className="h-4 w-4" /> Odrzucona
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
