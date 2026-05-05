import React, { useEffect } from 'react';
import { CalendarDays, Users, CheckCircle, Clock, XCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import reservationService from '../../services/reservation.service';

export function ClientReservationsList() {
  const { reservations, setReservations, tables } = useApp();

  useEffect(() => {
    let mounted = true;

    const fetchReservations = async () => {
      try {
        const allReservations = await reservationService.getMine();
        if (mounted) {
          setReservations(allReservations);
        }
      } catch {
        // Fallback is intentionally omitted so we only use backend-owned data.
      }
    };

    fetchReservations();

    return () => {
      mounted = false;
    };
  }, [setReservations]);

  const myReservations = reservations;

  return (
    <div className="max-w-4xl mx-auto p-6 mt-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
        <CalendarDays className="h-8 w-8 text-orange-500" /> Moje Rezerwacje
      </h2>
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
