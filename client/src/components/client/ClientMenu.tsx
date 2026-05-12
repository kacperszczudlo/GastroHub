import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { MenuItem } from '../../types';
import menuService from '../../services/menu.service';

export function ClientMenu() {
  const { menu, setMenu } = useApp();
  const [activeCat, setActiveCat] = useState<string>('');
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    const fetchMenu = async () => {
      try {
        const items = await menuService.getAll();
        if (mounted) {
          setMenu(items);
          setError('');
        }
      } catch (err) {
        if (mounted) {
          setMenu([]);
          setError('❌ Nie udało się pobrać menu. Sprawdź czy serwer API działa.');
          console.error('Błąd pobierania menu:', err);
        }
      }
    };

    fetchMenu();

    return () => {
      mounted = false;
    };
  }, [setMenu]);

  const categories = [...new Set(menu.map(item => item.category))];

  if (!activeCat && categories.length > 0) {
    setActiveCat(categories[0]);
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}
      <h2 className="text-4xl font-black text-center mt-4 mb-8 uppercase tracking-widest text-gray-800">
        Menu Restauracji
      </h2>

      <div className="flex flex-wrap justify-center gap-3 mb-10">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCat(cat)}
            className={`px-6 py-2 rounded-full font-medium transition ${
              activeCat === cat
                ? 'bg-red-800 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {menu
          .filter(m => m.category === activeCat)
          .map(item => (
            <MenuItemCard key={item.id} item={item} />
          ))}
      </div>
    </div>
  );
}

interface MenuItemCardProps {
  item: MenuItem;
}

function MenuItemCard({ item }: MenuItemCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition transform hover:-translate-y-1">
      <div className="relative h-64 bg-gray-100 flex items-center justify-center p-6">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover rounded-xl"
        />
      </div>
      <div className="p-6 flex flex-col">
        <h3 className="text-xl font-black text-gray-900 uppercase">{item.name}</h3>
        <p className="text-gray-500 text-sm mt-2 break-words leading-6">
          {item.desc}
        </p>
        <div className="mt-4 flex justify-between items-center">
          <span className="text-2xl font-bold text-orange-600">
            {item.price.toFixed(2)} zł
          </span>
        </div>
      </div>
    </div>
  );
}
