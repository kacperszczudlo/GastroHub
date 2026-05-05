import React, { useState, useEffect } from 'react';
import { Calendar, Users, CheckCircle, XCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { Table as TableType } from '../../types';
import tableService from '../../services/table.service';
import authService from '../../services/auth.service';
import orderService from '../../services/order.service';

interface TableModalProps {
  role: string | null;
}

interface Waiter {
  _id: string;
  email: string;
}

export function TableModal({ role }: TableModalProps) {
  const { selectedTable, setSelectedTable, tables, setTables, reservations } = useApp();
  const { email: currentUserEmail } = useAuth();
  const [waiters, setWaiters] = useState<Waiter[]>([]);
  const [loadingWaiters, setLoadingWaiters] = useState(false);
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
        setOpenOrder(resp?.data || resp || null);
      } catch (err) {
        console.error('Error loading open order for table modal:', err);
        if (mounted) setOpenOrder(null);
      }
    };

    loadOpenOrder();

    return () => { mounted = false; };
  }, [selectedTable]);

  const handleAssignMe = () => {
    if (!selectedTable || !currentUserEmail) return;
    const updated = tables.map(t =>
      t.id === selectedTable.id ? { ...t, waiter: currentUserEmail } : t
    );
    setTables(updated);
    setSelectedTable({ ...selectedTable, waiter: currentUserEmail });
    tableService.assignWaiter(selectedTable.id, currentUserEmail).catch(() => {
      // Backend can reject waiter permission depending on role policy.
    });
  };

  const handleUnassignMe = () => {
    if (!selectedTable) return;
    tableService.unassignWaiter(selectedTable.id)
      .then(updatedTable => {
        const nextTables = tables.map(t =>
          t.id === updatedTable.id ? updatedTable : t
        );
        setTables(nextTables);
        setSelectedTable(updatedTable);
      })
      .catch(err => {
        console.error('Błąd podczas odpinania kelnera:', err);
      });
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!selectedTable) return;
    const newStatus = e.target.value as TableType['status'];
    tableService.update(selectedTable.id, { ...selectedTable, status: newStatus })
      .then(updatedTable => {
        const nextTables = tables.map(t =>
          t.id === updatedTable.id ? updatedTable : t
        );
        setTables(nextTables);
        setSelectedTable(updatedTable);
      })
      .catch(err => {
        console.error('Błąd podczas zmiany statusu stolika:', err);
      });
  };

  if (!selectedTable) return null;

  const tableReservations = reservations.filter(
    r => r.tableId === selectedTable.id && r.status === 'accepted'
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-md relative">
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
            <span className="text-gray-600">Aktualny status:</span>
            <select
              value={selectedTable.status}
              onChange={handleStatusChange}
              className="border rounded px-2 py-1 bg-gray-50 font-medium"
            >
              <option value="free">🟢 Wolny</option>
              <option value="occupied">🔴 Zajęty</option>
              <option value="reserved">🟡 Zarezerwowany</option>
            </select>
          </div>

          <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border">
            <span className="text-gray-600">Obsługuje:</span>
            <div className="flex items-center gap-2 flex-1 ml-3">
              {role === 'admin' ? (
                <select
                  value={selectedTable.waiter || ''}
                  onChange={(e) => {
                    const newWaiter = e.target.value || null;
                    const request = newWaiter
                      ? tableService.assignWaiter(selectedTable.id, newWaiter)
                      : tableService.unassignWaiter(selectedTable.id);

                    request
                      .then(updatedTable => {
                        const nextTables = tables.map(t =>
                          t.id === updatedTable.id ? updatedTable : t
                        );
                        setTables(nextTables);
                        setSelectedTable(updatedTable);
                      })
                      .catch(err => {
                        console.error('Błąd podczas przypisywania kelnera:', err);
                      });
                  }}
                  className="flex-1 border rounded px-2 py-1 bg-white font-medium text-sm"
                  disabled={loadingWaiters}
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
                      className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded hover:bg-orange-200"
                    >
                      Przypisz mnie
                    </button>
                  )}
                  {role === 'waiter' && selectedTable.waiter && (
                    <button
                      onClick={handleUnassignMe}
                      className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded hover:bg-red-200"
                    >
                      Odepnij mnie
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

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
              {tableReservations.map(res => (
                <div key={res.id} className="bg-yellow-50 border border-yellow-200 p-2 rounded-lg text-sm">
                  <div className="font-bold text-yellow-800">
                    {res.date} o {res.time}
                  </div>
                  <div className="text-gray-700">
                    {res.clientName} ({res.guests} os.)
                  </div>
                </div>
              ))}
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
