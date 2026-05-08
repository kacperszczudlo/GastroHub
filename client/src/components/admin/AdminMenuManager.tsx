import React, { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, XCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useUiFeedback } from '../../context/UiFeedbackContext';
import { MenuItem } from '../../types';
import menuService from '../../services/menu.service';

export function AdminMenuManager() {
  const { menu, setMenu } = useApp();
  const { showSuccess, showError } = useUiFeedback();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [selectedImage, setSelectedImage] = useState('');
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
          console.error('Błąd pobierania menu:', err);
          setError('❌ Nie udało się pobrać menu. Sprawdź czy serwer API działa.');
        }
      }
    };

    fetchMenu();

    return () => {
      mounted = false;
    };
  }, [setMenu]);

  const handleDelete = async (id: string) => {
    try {
      await menuService.delete(id);
      setMenu(menu.filter(m => m.id !== id));
      showSuccess('Pozycja menu została usunięta.');
    } catch {
      showError('Nie udało się usunąć pozycji menu.');
    }
  };

  const handleOpenForm = (item: MenuItem | null = null) => {
    setEditingItem(item);
    setSelectedImage(item?.image || '');
    setIsModalOpen(true);
  };

  const fileToDataUrl = (file: File) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Nie udało się odczytać pliku'));
    reader.readAsDataURL(file);
  });

  const handleSaveForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const imageFile = formData.get('imageFile');

    let imageValue = selectedImage;
    if (imageFile instanceof File && imageFile.size > 0) {
      imageValue = await fileToDataUrl(imageFile);
    }

    if (!imageValue && !editingItem) {
      showError('Wybierz plik ze zdjęciem potrawy.');
      return;
    }

    const newItem: MenuItem = {
      id: editingItem?.id || Date.now().toString(),
      name: formData.get('name') as string,
      category: formData.get('category') as string,
      price: parseFloat(formData.get('price') as string),
      image: imageValue || editingItem?.image || '',
      desc: (formData.get('desc') as string) || 'Brak opisu.'
    };

    try {
      if (editingItem) {
        const updated = await menuService.update(editingItem.id, newItem);
        setMenu(menu.map(m => (m.id === editingItem.id ? updated : m)));
      } else {
        const created = await menuService.create({
          name: newItem.name,
          category: newItem.category,
          price: newItem.price,
          image: newItem.image,
          desc: newItem.desc
        });
        setMenu([...menu, created]);
      }
    } catch {
      showError('Nie udało się zapisać zmian w menu.');
      return;
    }
    showSuccess(editingItem ? 'Danie zostało zaktualizowane.' : 'Danie zostało dodane.');
    setIsModalOpen(false);
    setEditingItem(null);
    setSelectedImage('');
  };

  return (
    <div className="p-6 max-w-5xl mx-auto relative">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Zarządzanie Menu (CRUD)</h2>
        <button
          onClick={() => handleOpenForm(null)}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2"
        >
          <Plus className="h-5 w-5" /> Dodaj nowe danie
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="bg-white shadow-md rounded-xl overflow-x-auto border">
        <table className="min-w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 text-gray-600 text-sm font-bold">
              <th className="p-3 whitespace-nowrap">Zdjęcie</th>
              <th className="p-3 whitespace-nowrap">Nazwa</th>
              <th className="p-3 whitespace-nowrap">Kategoria</th>
              <th className="p-3 whitespace-nowrap">Cena</th>
              <th className="p-3 whitespace-nowrap text-right">Akcje</th>
            </tr>
          </thead>
          <tbody>
            {menu.map(item => (
              <tr key={item.id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="p-3 whitespace-nowrap">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-12 w-12 rounded object-cover"
                  />
                </td>
                <td className="p-3 font-medium text-gray-900 max-w-xs truncate">{item.name}</td>
                <td className="p-3 text-gray-600 whitespace-nowrap">{item.category}</td>
                <td className="p-3 font-bold text-orange-600 whitespace-nowrap">{item.price.toFixed(2)} zł</td>
                <td className="p-3 text-right whitespace-nowrap flex gap-1 justify-end">
                  <button
                    onClick={() => handleOpenForm(item)}
                    className="text-blue-500 hover:text-blue-700 p-1"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-md relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
            >
              <XCircle className="h-6 w-6" />
            </button>
            <h3 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">
              {editingItem ? 'Edytuj danie' : 'Dodaj nowe danie'}
            </h3>
            <form onSubmit={handleSaveForm} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nazwa</label>
                <input
                  name="name"
                  defaultValue={editingItem?.name}
                  required
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kategoria</label>
                  <input
                    name="category"
                    defaultValue={editingItem?.category}
                    required
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cena (zł)</label>
                  <input
                    name="price"
                    type="number"
                    step="0.01"
                    defaultValue={editingItem?.price}
                    required
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Zdjęcie dania</label>
                <input
                  name="imageFile"
                  type="file"
                  accept="image/*"
                  className="w-full p-2 border rounded-lg bg-white"
                  onChange={async (event) => {
                    const file = event.currentTarget.files?.[0];
                    if (file) {
                      setSelectedImage(await fileToDataUrl(file));
                    }
                  }}
                />
                {selectedImage && (
                  <div className="mt-2">
                    <img src={selectedImage} alt="Podgląd" className="h-24 w-full rounded-lg object-cover border" />
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Opis</label>
                <textarea
                  name="desc"
                  defaultValue={editingItem?.desc}
                  className="w-full p-2 border rounded-lg"
                  rows={2}
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg shadow mt-4"
              >
                Zapisz zmiany
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
