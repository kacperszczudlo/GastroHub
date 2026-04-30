import React, { useState, useEffect } from 'react';
import { Plus, Minus, Trash2, CheckCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { OrderItem } from '../../types';
import { MOCK_MEALS } from '../../constants';
import menuService from '../../services/menu.service';

export function WaiterPOS() {
  const { menu, setMenu } = useApp();
  const [order, setOrder] = useState<OrderItem[]>([]);

  useEffect(() => {
    let mounted = true;

    const fetchMenu = async () => {
      try {
        const items = await menuService.getAll();
        if (mounted) {
          setMenu(items);
        }
      } catch {
        if (mounted) {
          setMenu(MOCK_MEALS);
        }
      }
    };

    fetchMenu();

    return () => {
      mounted = false;
    };
  }, [setMenu]);

  const addToOrder = (item: any) => {
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

  return (
    <div className="flex h-[calc(100vh-120px)] bg-gray-200">
      {/* Koszyk */}
      <div className="w-1/3 bg-white flex flex-col shadow-2xl z-10 border-r border-gray-300">
        <div className="bg-orange-400 text-white p-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">Zarządzanie Rachunkiem</h2>
            <p className="text-orange-100 text-sm">Obsługuje: Jan K. (Ty)</p>
          </div>
        </div>

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
            <button className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-lg shadow hover:bg-blue-700 transition">
              Zapisz jako otwarty
            </button>
            <button
              onClick={() => {
                alert(`Zrealizowano płatność na kwotę: ${total.toFixed(2)} zł`);
                setOrder([]);
              }}
              className="flex-1 bg-green-500 text-white font-bold py-3 rounded-lg shadow hover:bg-green-600 transition"
            >
              Zakończ / Zapłać
            </button>
          </div>
        </div>
      </div>

      {/* Menu */}
      <div className="w-2/3 p-4 overflow-y-auto">
        <div className="grid grid-cols-4 gap-4 mb-6">
          {['Pizza', 'Burgery', 'Makarony', 'Napoje'].map(cat => (
            <div
              key={cat}
              className="bg-white rounded-xl shadow-sm overflow-hidden cursor-pointer hover:ring-2 ring-orange-400"
            >
              <div className="h-20 bg-gray-300">
                <img
                  src={`https://source.unsplash.com/200x200/?${cat.toLowerCase()}`}
                  alt={cat}
                  className="w-full h-full object-cover opacity-80"
                />
              </div>
              <div className="p-2 text-center font-medium text-sm text-gray-700">{cat}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-4">
          {menu.map(item => (
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
