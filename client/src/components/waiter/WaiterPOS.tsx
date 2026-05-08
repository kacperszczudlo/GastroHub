import React, { useEffect, useState } from 'react';
import { Plus, Minus, Trash2, CheckCircle, RefreshCw } from 'lucide-react';
import { OrderItem, MenuItem } from '../../types';
import { useApp } from '../../context/AppContext';
import menuService from '../../services/menu.service';
import tableService from '../../services/table.service';
import orderService from '../../services/order.service';

export function WaiterPOS() {
  const { menu, setMenu, tables, setTables, selectedTable, setSelectedTable } = useApp();
  const [order, setOrder] = useState<OrderItem[]>([]);
  const [selectedTableId, setSelectedTableId] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        const [items, apiTables] = await Promise.all([
          menuService.getAll(),
          tableService.getAll()
        ]);
        if (mounted) {
          setMenu(items);
          setTables(apiTables);
          setSelectedTableId(prev => prev || apiTables[0]?.id || '');
          setError('');
        }
      } catch (err) {
        if (mounted) {
          setMenu([]);
          setTables([]);
          setSelectedTableId('');
          setError('❌ Nie udało się pobrać danych z backendu. Sprawdź czy serwer API działa.');
          console.error('Błąd pobierania danych POS:', err);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, [setMenu, setTables]);

  useEffect(() => {
    if (!selectedTableId) {
      return;
    }

    let mounted = true;

    const loadOpenOrder = async () => {
      try {
        const existing = await orderService.getOpenOrderByTable(selectedTableId);
        if (!mounted) {
          return;
        }

        if (!existing) {
          setOrder([]);
          return;
        }

        const mappedItems = (existing.items || []).map((item: any) => ({
          id: item.menuItemId?._id?.toString?.() || item.menuItemId?.toString?.() || item.menuItemId,
          name: item.menuItemId?.name || item.name || 'Pozycja menu',
          category: item.menuItemId?.category || 'Menu',
          price: Number(item.menuItemId?.price || item.price || 0),
          image: item.menuItemId?.image || item.image || '',
          desc: item.menuItemId?.description || item.desc || '',
          qty: item.quantity
        }));

        setOrder(mappedItems);
      } catch {
        if (mounted) {
          setOrder([]);
        }
      }
    };

    loadOpenOrder();

    return () => {
      mounted = false;
    };
  }, [selectedTableId]);

  const localSelectedTable = tables.find(table => table.id === selectedTableId) || null;

  const addToOrder = (item: MenuItem) => {
    setOrder(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => (i.id === item.id ? { ...i, qty: i.qty + 1 } : i));
      }
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const removeFromOrder = (id: string) => {
    setOrder(prev => prev.filter(i => i.id !== id));
  };

  const decreaseQty = (id: string) => {
    setOrder(prev =>
      prev
        .map(i => (i.id === id ? { ...i, qty: i.qty - 1 } : i))
        .filter(i => i.qty > 0)
    );
  };

  const total = order.reduce((sum, item) => sum + item.price * item.qty, 0);

  const refreshTables = async () => {
    try {
      const apiTables = await tableService.getAll();
      setTables(apiTables);
      if (selectedTableId) {
        const updated = apiTables.find(t => t.id === selectedTableId);
        if (updated) setSelectedTable(updated);
      }
    } catch (err) {
      console.error('Błąd odświeżania stoliów:', err);
    }
  };

  const handleSaveAsOpen = async () => {
    if (!selectedTableId) {
      setError('Wybierz stolik przed zapisaniem rachunku.');
      return;
    }

    if (order.length === 0) {
      setError('Dodaj pozycje do zamówienia przed zapisem.');
      return;
    }

    try {
      const items = orderService.mapToPayload(order);
      const waiter = localSelectedTable?.waiter || null;
      const existingOrder = await orderService.getOpenOrderByTable(selectedTableId);

      if (existingOrder) {
        const existingId = existingOrder._id || existingOrder.id;
        console.log('Aktualizuję istniejące zamówienie:', existingId);
        await orderService.updateOrderItems(existingId, { items, waiter });
      } else {
        console.log('Tworzę nowe zamówienie dla stolika:', selectedTableId);
        await orderService.createOpenOrder({ tableId: selectedTableId, waiter, items });
      }
      setError('');
      await refreshTables();
    } catch (err: any) {
      console.error('Błąd podczas zapisywania zamówienia:', err);
      console.error('Szczegóły błędu:', err.response?.data || err.message);
      setError(`Błąd: ${err.response?.data?.error || err.response?.data?.details || err.message || 'Nieznany błąd'}`);
    }
  };

  const handlePay = async () => {
    if (order.length === 0) {
      setError('Rachunek jest pusty!');
      return;
    }

    try {
      const activeOrder = await orderService.getOpenOrderByTable(selectedTableId);
      const activeOrderId = activeOrder?._id || activeOrder?.id || localSelectedTable?.orderId;

      if (activeOrderId) {
        console.log('💳 Completing order:', activeOrderId);
        await orderService.completeOrder(activeOrderId);
        console.log('✅ Order paid successfully');
      }
      setOrder([]);
      if (selectedTableId) {
        const updatedTable = await tableService.getById(selectedTableId);
        setSelectedTable(updatedTable);
      }
      setError('');
      await refreshTables();
    } catch (err: any) {
      console.error('Błąd podczas finalizacji płatności:', err);
      console.error('Szczegóły błędu:', err.response?.data || err.message);
      setError(`Błąd: ${err.response?.data?.error || err.message || 'Nie udało się zakończyć zamówienia w backendzie.'}`);
    }
  };

  return (
    <div className="flex h-[calc(100vh-120px)] bg-gray-200">
      {/* Koszyk */}
      <div className="w-1/3 bg-white flex flex-col shadow-2xl z-10 border-r border-gray-300">
        <div className="bg-orange-400 text-white p-4 flex flex-col gap-2">
          <div>
            <h2 className="text-xl font-bold">Zarządzanie Rachunkiem</h2>
            <p className="text-orange-100 text-sm">Obsługuje: {localSelectedTable?.waiter || 'Brak przypisania'}</p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={selectedTableId}
              onChange={(e) => setSelectedTableId(e.target.value)}
              className="w-full bg-white text-gray-800 text-sm font-bold py-1 px-2 rounded outline-none"
            >
              {tables.map(table => (
                <option key={table.id} value={table.id}>
                  Stolik #{table.number}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading && (
          <div className="px-4 py-2 text-sm text-gray-500 flex items-center gap-2 border-b">
            <RefreshCw className="h-4 w-4 animate-spin" /> Ładowanie danych...
          </div>
        )}

        {error && (
          <div className="mx-4 mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {order.length === 0 ? (
            <div className="text-center text-gray-400 mt-10">
              Wybierz dania z menu po prawej stronie
            </div>
          ) : (
            order.map(item => (
              <div key={item.id} className="flex justify-between items-start border-b pb-2">
                <div className="flex-1">
                  <h4 className="font-bold text-gray-800">{item.name}</h4>
                  <div className="text-xs text-green-600 flex items-center gap-1 mt-1">
                    <CheckCircle className="h-3 w-3" /> Dodano do zamówienia
                  </div>
                </div>
                <div className="text-right flex flex-col items-end gap-2">
                  <span className="font-bold text-gray-900">
                    {(item.price * item.qty).toFixed(2)} zł
                  </span>
                  <div className="flex items-center gap-2 bg-gray-100 rounded-md px-2 py-1">
                    <button
                      onClick={() => decreaseQty(item.id)}
                      className="text-gray-600 hover:text-gray-800"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="text-sm text-gray-600">x{item.qty}</span>
                    <button
                      onClick={() => addToOrder(item)}
                      className="text-gray-600 hover:text-gray-800"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => removeFromOrder(item.id)}
                      className="text-red-500 hover:text-red-700 ml-2"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 bg-gray-50 border-t">
          <div className="flex justify-between items-end mb-4">
            <span className="text-xl font-bold text-gray-800">Razem:</span>
            <span className="text-3xl font-black text-gray-900">{total.toFixed(2)} zł</span>
          </div>
          <div className="flex gap-2">
            <button onClick={handleSaveAsOpen} className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-lg shadow hover:bg-blue-700 transition">
              Zapisz jako otwarty
            </button>
            <button onClick={handlePay} className="flex-1 bg-green-500 text-white font-bold py-3 rounded-lg shadow hover:bg-green-600 transition">
              Zakończ / Zapłać
            </button>
          </div>
        </div>
      </div>

      {/* Menu */}
      <div className="w-2/3 p-4 overflow-y-auto">
        {/* Dynamiczne kategorie */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                selectedCategory === null
                  ? 'bg-orange-500 text-white'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              Wszystkie
            </button>
            {Array.from(new Set(menu.map(item => item.category)))
              .filter(cat => cat && cat.trim())
              .sort()
              .map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    selectedCategory === category
                      ? 'bg-orange-500 text-white'
                      : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {category}
                </button>
              ))}
          </div>
        </div>

        {/* Menu Items */}
        <div className="grid grid-cols-3 gap-4">
          {menu
            .filter(item => !selectedCategory || item.category === selectedCategory)
            .map(item => (
              <div
                key={item.id}
                onClick={() => addToOrder(item)}
                className="bg-white rounded-xl p-3 shadow-sm cursor-pointer hover:shadow-md transition active:scale-95 flex flex-col h-full"
              >
                <div className="h-24 rounded-lg overflow-hidden mb-2 relative">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  <div className="absolute bottom-0 right-0 bg-white px-2 py-1 text-xs font-bold rounded-tl-lg shadow-sm">
                    {item.price.toFixed(2)} zł
                  </div>
                </div>
                <h4 className="font-bold text-sm text-gray-800 leading-tight flex-1">{item.name}</h4>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
