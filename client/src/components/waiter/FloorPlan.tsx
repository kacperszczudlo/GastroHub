import React, { useState, useEffect } from 'react';
import { Users } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Table } from '../../types';
import { INITIAL_TABLES } from '../../constants';
import tableService from '../../services/table.service';

interface FloorPlanProps {
  editable?: boolean;
}

export function FloorPlan({ editable = false }: FloorPlanProps) {
  const { tables, setTables, setSelectedTable } = useApp();
  const [localTables, setLocalTables] = useState<Table[]>(tables);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragMode, setDragMode] = useState(editable);

  useEffect(() => {
    let mounted = true;

    const fetchTables = async () => {
      try {
        const apiTables = await tableService.getAll();
        if (mounted) {
          setTables(apiTables);
          setLocalTables(apiTables);
        }
      } catch {
        if (mounted && tables.length === 0) {
          setTables(INITIAL_TABLES);
          setLocalTables(INITIAL_TABLES);
        }
      }
    };

    if (tables.length === 0) {
      fetchTables();
    } else {
      setLocalTables(tables);
    }

    return () => {
      mounted = false;
    };
  }, [tables, setTables]);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, id: string) => {
    if (!dragMode) return;
    setDraggingId(id);
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    e.dataTransfer!.setData('offsetX', (e.clientX - rect.left).toString());
    e.dataTransfer!.setData('offsetY', (e.clientY - rect.top).toString());
    e.dataTransfer!.setData('id', id.toString());
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    if (!dragMode) return;
    e.preventDefault();
    const id = e.dataTransfer!.getData('id');
    const offsetX = parseFloat(e.dataTransfer!.getData('offsetX'));
    const offsetY = parseFloat(e.dataTransfer!.getData('offsetY'));

    const containerRect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    let x = ((e.clientX - containerRect.left - offsetX) / containerRect.width) * 100;
    let y = ((e.clientY - containerRect.top - offsetY) / containerRect.height) * 100;

    x = Math.max(0, Math.min(x, 90));
    y = Math.max(0, Math.min(y, 90));

    const updated = localTables.map(t => (t.id === id ? { ...t, x, y } : t));
    setLocalTables(updated);
    setTables(updated);

    if (editable) {
      const changed = updated.find(t => t.id === id);
      if (changed) {
        tableService.updatePosition(id, changed.x, changed.y).catch(() => {
          // Layout update is non-blocking in UI; backend sync can be retried on next drag.
        });
      }
    }

    setDraggingId(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'free':
        return 'bg-green-100 border-green-500 text-green-800';
      case 'occupied':
        return 'bg-red-100 border-red-500 text-red-800';
      case 'reserved':
        return 'bg-yellow-100 border-yellow-500 text-yellow-800';
      default:
        return 'bg-gray-100 border-gray-500';
    }
  };

  const handleTableClick = (table: Table) => {
    if (dragMode) return;
    setSelectedTable(table);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-4">
          {dragMode ? 'Konfiguracja układu sali (Przeciągnij)' : 'Panel sali (Kliknij w stolik)'}
          {editable && (
            <button
              onClick={() => setDragMode(!dragMode)}
              className="text-sm bg-purple-100 text-purple-700 px-4 py-1.5 rounded-lg hover:bg-purple-200 transition border border-purple-200"
            >
              {dragMode ? 'Przełącz na: Zarządzanie stolikami' : 'Przełącz na: Edycja układu (Drag&Drop)'}
            </button>
          )}
        </h2>
        {!dragMode && (
          <div className="flex gap-4 text-sm font-medium">
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-green-100 border border-green-500 rounded"></div> Wolny
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-red-100 border border-red-500 rounded"></div> Zajęty
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-yellow-100 border border-yellow-500 rounded"></div> Zarezerwowany
            </div>
          </div>
        )}
      </div>

      <div
        className="relative w-full h-[600px] bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl overflow-hidden shadow-inner"
        onDragOver={e => dragMode && e.preventDefault()}
        onDrop={handleDrop}
      >
        {localTables.map(table => (
          <div
            key={table.id}
            draggable={dragMode}
            onDragStart={e => handleDragStart(e, table.id)}
            onClick={() => handleTableClick(table)}
            className={`absolute border-2 rounded-xl shadow-md flex flex-col items-center justify-center transition-colors
              ${getStatusColor(table.status)}
              ${dragMode ? 'hover:ring-4 ring-purple-300 cursor-move' : 'cursor-pointer hover:scale-105'}
              ${draggingId === table.id ? 'opacity-50' : ''}
            `}
            style={{
              left: `${table.x}%`,
              top: `${table.y}%`,
              width: table.seats > 4 ? '120px' : '80px',
              height: table.seats > 4 ? '80px' : '80px'
            }}
          >
            <span className="font-bold text-lg">#{table.number}</span>
            <span className="text-xs flex items-center gap-1">
              <Users className="h-3 w-3" /> {table.seats}
            </span>
            {table.waiter && (
              <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded-full shadow border border-white">
                {table.waiter.split(' ')[0]}
              </div>
            )}
          </div>
        ))}

        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-8 bg-gray-800 rounded-b-xl flex items-center justify-center text-white text-xs font-bold uppercase tracking-widest">
          Bar
        </div>
        <div className="absolute bottom-4 right-4 w-24 h-8 border-2 border-gray-400 flex items-center justify-center text-gray-500 text-xs font-bold bg-white opacity-80">
          Wejście
        </div>
      </div>
    </div>
  );
}
