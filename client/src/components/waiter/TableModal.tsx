import React from 'react';
import { Calendar, Users, CheckCircle, XCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Table as TableType } from '../../types';
import tableService from '../../services/table.service';

interface TableModalProps {
  role: string | null;
}

export function TableModal({ role }: TableModalProps) {
  const { selectedTable, setSelectedTable, tables, setTables, reservations } = useApp();

  if (!selectedTable) return null;

  const tableReservations = reservations.filter(
    r => r.tableId === selectedTable.id && r.status === 'accepted'
  );

  const handleAssignMe = () => {
    const updated = tables.map(t =>
      t.id === selectedTable.id ? { ...t, waiter: 'Jan K. (Ty)' } : t
    );
    setTables(updated);
    setSelectedTable({ ...selectedTable, waiter: 'Jan K. (Ty)' });
    tableService.assignWaiter(selectedTable.id, 'Jan K. (Ty)').catch(() => {
      // Backend can reject waiter permission depending on role policy.
    });
  };

  const handleUnassignMe = () => {
    const updated = tables.map(t =>
      t.id === selectedTable.id ? { ...t, waiter: null } : t
    );
    setTables(updated);
    setSelectedTable({ ...selectedTable, waiter: null });
    tableService.assignWaiter(selectedTable.id, null).catch(() => {
      // Backend can reject waiter permission depending on role policy.
    });
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as TableType['status'];
    const updated = tables.map(t =>
      t.id === selectedTable.id ? { ...t, status: newStatus } : t
    );
    setTables(updated);
    setSelectedTable({ ...selectedTable, status: newStatus });
    tableService.update(selectedTable.id, { ...selectedTable, status: newStatus }).catch(() => {
      // Backend can reject waiter permission depending on role policy.
    });
  };

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
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-800">{selectedTable.waiter || 'Brak'}</span>
              {role === 'waiter' && !selectedTable.waiter && (
                <button
                  onClick={handleAssignMe}
                  className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded hover:bg-orange-200 flex items-center gap-1"
                >
                  Przypisz mnie
                </button>
              )}
              {role === 'waiter' && selectedTable.waiter === 'Jan K. (Ty)' && (
                <button
                  onClick={handleUnassignMe}
                  className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded hover:bg-red-200 flex items-center gap-1"
                >
                  Odepnij mnie
                </button>
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
      </div>
    </div>
  );
}
