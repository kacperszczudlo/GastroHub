import { useState, useEffect, useMemo } from 'react';
import { Calendar, Users, XCircle, UserCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useUiFeedback } from '../../context/UiFeedbackContext';
import type { Table as TableType, Reservation, UserRole } from '../../types';
import tableService from '../../services/table.service';
import authService from '../../services/auth.service';
import orderService from '../../services/order.service';
import reservationService from '../../services/reservation.service';

interface TableModalProps {
  role: UserRole;
}

interface Waiter {
  _id: string;
  email: string;
}

// Window (in minutes) before the reservation start when staff can already check-in
// the client. Should mirror RESERVATION_HOLD_MINUTES on the backend.
const CHECK_IN_WINDOW_MINUTES = 60;

const buildReservationStart = (reservation: Reservation): Date | null => {
  if (!reservation?.date) return null;
  const [y, m, d] = reservation.date.split('-').map(Number);
  const [hh = 0, mm = 0] = (reservation.time || '0:0').split(':').map(Number);
  const date = new Date(y, (m || 1) - 1, d || 1, hh, mm, 0, 0);
  return Number.isNaN(date.getTime()) ? null : date;
};

const formatStatus = (status: TableType['status']) => {
  switch (status) {
    case 'free':
      return { label: 'Wolny', className: 'bg-green-100 text-green-800 border-green-300' };
    case 'occupied':
      return { label: 'Zajęty', className: 'bg-red-100 text-red-800 border-red-300' };
    case 'reserved':
      return { label: 'Zarezerwowany', className: 'bg-yellow-100 text-yellow-800 border-yellow-300' };
    default:
      return { label: status, className: 'bg-gray-100 text-gray-700 border-gray-300' };
  }
};

const formatReservationStatus = (status: Reservation['status']) => {
  switch (status) {
    case 'accepted':
      return { label: 'Zatwierdzona', className: 'bg-yellow-100 text-yellow-800' };
    case 'active':
      return { label: 'Klient na miejscu', className: 'bg-red-100 text-red-800' };
    case 'completed':
      return { label: 'Zrealizowana', className: 'bg-gray-100 text-gray-700' };
    default:
      return { label: status, className: 'bg-gray-100 text-gray-700' };
  }
};

export function TableModal({ role }: TableModalProps) {
  const { selectedTable, setSelectedTable, tables, setTables, reservations, setReservations } = useApp();
  const { email: currentUserEmail } = useAuth();
  const { showSuccess, showError } = useUiFeedback();
  const [waiters, setWaiters] = useState<Waiter[]>([]);
  const [loadingWaiters, setLoadingWaiters] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [openOrder, setOpenOrder] = useState<any | null>(null);

  useEffect(() => {
    if (selectedTable && role === 'admin') {
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
  }, [selectedTable, role]);

  useEffect(() => {
    let mounted = true;
    const loadOpenOrder = async () => {
      if (!selectedTable) {
        setOpenOrder(null);
        return;
      }
      try {
        const resp = await orderService.getOpenOrderByTable(selectedTable.id);
        if (!mounted) return;
        setOpenOrder(resp || null);
      } catch (err) {
        console.error('Error loading open order for table modal:', err);
        if (mounted) setOpenOrder(null);
      }
    };

    loadOpenOrder();

    return () => { mounted = false; };
  }, [selectedTable]);

  const tableReservations = useMemo(() => {
    if (!selectedTable) return [] as Reservation[];
    return reservations
      .filter(r => r.tableId === selectedTable.id && (r.status === 'accepted' || r.status === 'active'))
      .sort((a, b) => {
        const aStart = buildReservationStart(a)?.getTime() ?? 0;
        const bStart = buildReservationStart(b)?.getTime() ?? 0;
        return aStart - bStart;
      });
  }, [reservations, selectedTable]);

  // Reservation that is closest to "now" and within the check-in window.
  // Lets the staff click "Klient przybył" without picking from a list.
  const checkInCandidate = useMemo(() => {
    const now = Date.now();
    return tableReservations.find(r => {
      if (r.status !== 'accepted') return false;
      const start = buildReservationStart(r);
      if (!start) return false;
      const diffMinutes = (start.getTime() - now) / 60000;
      // Allow a 15 min late grace beyond the start time, plus the upfront window.
      return diffMinutes <= CHECK_IN_WINDOW_MINUTES && diffMinutes >= -15;
    });
  }, [tableReservations]);

  const activeReservation = useMemo(
    () => tableReservations.find(r => r.status === 'active') || null,
    [tableReservations]
  );

  const handleAssignMe = async () => {
    if (!selectedTable || !currentUserEmail || processing) return;
    setProcessing(true);
    try {
      const updatedTable = await tableService.assignWaiter(selectedTable.id, currentUserEmail);
      const nextTables = tables.map(t => (t.id === updatedTable.id ? updatedTable : t));
      setTables(nextTables);
      setSelectedTable(updatedTable);
    } catch (err) {
      console.error('Błąd podczas przypisywania się do stolika:', err);
    } finally {
      setProcessing(false);
    }
  };

  const handleUnassignMe = async () => {
    if (!selectedTable || processing) return;
    setProcessing(true);
    try {
      const updatedTable = await tableService.unassignWaiter(selectedTable.id);
      const nextTables = tables.map(t => (t.id === updatedTable.id ? updatedTable : t));
      setTables(nextTables);
      setSelectedTable(updatedTable);
    } catch (err) {
      console.error('Błąd podczas odpinania kelnera:', err);
    } finally {
      setProcessing(false);
    }
  };

  const refreshTables = async () => {
    try {
      const fresh = await tableService.getAll();
      setTables(fresh);
      if (selectedTable) {
        const updated = fresh.find(t => t.id === selectedTable.id) || null;
        setSelectedTable(updated);
      }
    } catch (err) {
      console.error('Błąd odświeżania stolików:', err);
    }
  };

  const handleCheckIn = async () => {
    if (!checkInCandidate || processing) return;
    setProcessing(true);
    try {
      const updated = await reservationService.checkIn(checkInCandidate.id);
      setReservations(prev => prev.map(r => (r.id === updated.id ? updated : r)));
      await refreshTables();
      showSuccess('Klient został oznaczony jako przybyły. Stolik jest teraz zajęty.');
    } catch (err: any) {
      console.error('Błąd check-in rezerwacji:', err);
      showError(err?.response?.data?.details || 'Nie udało się oznaczyć klienta jako przybyłego.');
    } finally {
      setProcessing(false);
    }
  };

  const handleCompleteActive = async () => {
    if (!activeReservation || processing) return;
    if (openOrder) {
      showError('Stolik ma otwarte zamówienie - zakończ je przez "Zapłać" w POS.');
      return;
    }
    setProcessing(true);
    try {
      const updated = await reservationService.complete(activeReservation.id);
      setReservations(prev => prev.map(r => (r.id === updated.id ? updated : r)));
      await refreshTables();
      showSuccess('Wizyta zakończona, stolik zwolniony.');
    } catch (err: any) {
      console.error('Błąd kończenia rezerwacji:', err);
      showError(err?.response?.data?.details || 'Nie udało się zwolnić stolika.');
    } finally {
      setProcessing(false);
    }
  };

  if (!selectedTable) return null;

  const statusBadge = formatStatus(selectedTable.status);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-md relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={() => setSelectedTable(null)}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
        >
          <XCircle className="h-6 w-6" />
        </button>

        <h3 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">
          Stolik #{selectedTable.number}
        </h3>

        <div className="space-y-4 mb-6">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Liczba miejsc:</span>
            <span className="font-bold flex items-center gap-1">
              <Users className="h-4 w-4" /> {selectedTable.seats}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-600">Status:</span>
            <span className={`px-3 py-1 rounded-full text-sm font-bold border ${statusBadge.className}`}>
              {statusBadge.label}
            </span>
          </div>

          <p className="text-xs text-gray-500 -mt-2">
            Status wyliczany automatycznie z aktywnych rezerwacji i otwartych zamówień.
          </p>

          <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border">
            <span className="text-gray-600">Obsługuje:</span>
            <div className="flex items-center gap-2 flex-1 ml-3">
              {role === 'admin' ? (
                <select
                  value={selectedTable.waiter || ''}
                  onChange={async (e) => {
                    const newWaiter = e.target.value || null;
                    if (processing) return;
                    setProcessing(true);
                    try {
                      const updatedTable = newWaiter
                        ? await tableService.assignWaiter(selectedTable.id, newWaiter)
                        : await tableService.unassignWaiter(selectedTable.id);
                      const nextTables = tables.map(t => (t.id === updatedTable.id ? updatedTable : t));
                      setTables(nextTables);
                      setSelectedTable(updatedTable);
                    } catch (err) {
                      console.error('[Admin] Błąd podczas przypisywania kelnera:', err);
                    } finally {
                      setProcessing(false);
                    }
                  }}
                  className="flex-1 border rounded px-2 py-1 bg-white font-medium text-sm"
                  disabled={loadingWaiters || processing}
                >
                  <option value="">-- Brak przypisania --</option>
                  {waiters.map(waiter => (
                    <option key={waiter._id} value={waiter.email}>
                      {waiter.email}
                    </option>
                  ))}
                </select>
              ) : (
                <>
                  <span className="font-bold text-gray-800 flex-1">{selectedTable.waiter || 'Brak'}</span>
                  {role === 'waiter' && !selectedTable.waiter && (
                    <button
                      onClick={handleAssignMe}
                      disabled={processing}
                      className={`text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded hover:bg-orange-200 ${processing ? 'opacity-60 cursor-not-allowed' : ''}`}
                    >
                      Przypisz mnie
                    </button>
                  )}

                  {role === 'waiter' && selectedTable.waiter === currentUserEmail && (
                    <button
                      onClick={handleUnassignMe}
                      disabled={processing}
                      className={`text-xs bg-red-100 text-red-600 px-2 py-1 rounded hover:bg-red-200 ${processing ? 'opacity-60 cursor-not-allowed' : ''}`}
                    >
                      Odepnij mnie
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {checkInCandidate && (
          <div className="mb-6 p-4 rounded-lg border-2 border-orange-300 bg-orange-50">
            <div className="font-semibold text-orange-900 mb-1">
              Czeka rezerwacja na {checkInCandidate.time}
            </div>
            <p className="text-sm text-orange-800 mb-3">
              {checkInCandidate.clientName} • {checkInCandidate.guests} os. • {checkInCandidate.date}
            </p>
            <button
              onClick={handleCheckIn}
              disabled={processing}
              className={`w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 rounded-lg flex items-center justify-center gap-2 ${processing ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              <UserCheck className="h-4 w-4" />
              Klient przybył
            </button>
          </div>
        )}

        {activeReservation && (
          <div className="mb-6 p-4 rounded-lg border border-red-200 bg-red-50">
            <div className="font-semibold text-red-900">Klient na miejscu</div>
            <p className="text-sm text-red-800 mt-1">
              {activeReservation.clientName} • {activeReservation.guests} os. • zaczęło się o {activeReservation.time}
            </p>
            <p className="text-xs text-red-700 mt-2">
              Stolik zwolni się automatycznie po opłaceniu zamówienia.
            </p>
            {!openOrder && (
              <button
                onClick={handleCompleteActive}
                disabled={processing}
                className={`mt-3 w-full bg-white border border-red-300 hover:bg-red-100 text-red-700 font-semibold py-2 rounded-lg ${processing ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                Zwolnij stolik (klient wyszedł bez zamówienia)
              </button>
            )}
          </div>
        )}

        <div>
          <h4 className="font-bold text-gray-700 mb-2 flex items-center gap-2">
            <Calendar className="h-4 w-4" /> Nadchodzące rezerwacje
          </h4>
          {tableReservations.length === 0 ? (
            <p className="text-sm text-gray-500 italic bg-gray-50 p-3 rounded">
              Brak przypisanych rezerwacji dla tego stolika.
            </p>
          ) : (
            <div className="space-y-2">
              {tableReservations.map(res => {
                const badge = formatReservationStatus(res.status);
                return (
                  <div key={res.id} className="bg-yellow-50 border border-yellow-200 p-2 rounded-lg text-sm">
                    <div className="flex justify-between items-center">
                      <div className="font-bold text-yellow-800">
                        {res.date} o {res.time}
                      </div>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${badge.className}`}>
                        {badge.label}
                      </span>
                    </div>
                    <div className="text-gray-700">
                      {res.clientName} ({res.guests} os.)
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <div className="mt-4">
          <h4 className="font-bold text-gray-700 mb-2">Aktualne otwarte zamówienie</h4>
          {!openOrder ? (
            <p className="text-sm text-gray-500 italic bg-gray-50 p-3 rounded">Brak otwartego zamówienia.</p>
          ) : (
            <div className="bg-white p-3 rounded border">
              <div className="text-sm text-gray-700 mb-2">ID zamówienia: {openOrder._id || openOrder.id}</div>
              <ul className="space-y-2">
                {(openOrder.items || []).map((it: any, idx: number) => (
                  <li key={it.menuItemId?._id || it.menuItemId || idx} className="flex justify-between">
                    <div>
                      <div className="font-medium">{it.menuItemId?.name || it.name || 'Pozycja'}</div>
                      <div className="text-xs text-gray-500">{it.menuItemId?.description || ''}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">x{it.quantity}</div>
                      <div className="text-xs text-gray-600">{(it.menuItemId?.price || it.price || 0).toFixed(2)} zł</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
