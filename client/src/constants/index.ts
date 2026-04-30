// Stałe aplikacji

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Domyślne dane mockowe
export const INITIAL_TABLES = [
  { id: '1', number: 1, seats: 2, status: 'free' as const, x: 10, y: 10, waiter: null },
  { id: '2', number: 2, seats: 4, status: 'occupied' as const, x: 30, y: 10, waiter: 'Jan K.' },
  { id: '3', number: 3, seats: 6, status: 'reserved' as const, x: 60, y: 20, waiter: null },
  { id: '4', number: 4, seats: 2, status: 'free' as const, x: 10, y: 50, waiter: null },
  { id: '5', number: 5, seats: 4, status: 'free' as const, x: 40, y: 60, waiter: null },
  { id: '6', number: 6, seats: 8, status: 'occupied' as const, x: 70, y: 60, waiter: 'Marta W.' },
];

export const MOCK_MEALS = [
  { id: '1', name: 'Fish Burger', category: 'Burgery', price: 24.99, image: 'https://www.themealdb.com/images/media/meals/1529445882.jpg', desc: 'Świeży filet rybny z sosem tatarskim.' },
  { id: '2', name: 'Bacon Cheeseburger', category: 'Burgery', price: 29.99, image: 'https://www.themealdb.com/images/media/meals/urzj1d1587670726.jpg', desc: 'Podwójny bekon, wołowina 200g, ser cheddar.' },
  { id: '3', name: 'Margherita Pizza', category: 'Pizza', price: 32.00, image: 'https://www.themealdb.com/images/media/meals/x0lk931587671540.jpg', desc: 'Klasyczna włoska pizza z mozzarellą.' },
  { id: '4', name: 'Spaghetti Carbonara', category: 'Makarony', price: 28.50, image: 'https://www.themealdb.com/images/media/meals/llcbn01574260722.jpg', desc: 'Oryginalna receptura z guanciale i pecorino.' },
  { id: '5', name: 'Chocolate Souffle', category: 'Desery', price: 18.00, image: 'https://www.themealdb.com/images/media/meals/twspvx1511784937.jpg', desc: 'Płynna czekolada w środku, podawany z lodami.' },
  { id: '6', name: 'Mojito', category: 'Napoje', price: 15.00, image: 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?auto=format&fit=crop&q=80&w=200&h=200', desc: 'Orzeźwiający drink z miętą i limonką.' }
];

export const INITIAL_RESERVATIONS = [
  { id: '1', date: '2026-05-10', time: '18:00', guests: 4, status: 'accepted' as const, tableId: '3', clientName: 'Jan Kowalski' },
  { id: '2', date: '2026-05-11', time: '19:30', guests: 2, status: 'pending' as const, tableId: null, clientName: 'Anna Nowak' },
];

export const INITIAL_SCHEDULE = [
  { id: '1', date: '2026-05-10', shift: 'Zmiana Poranna (8:00 - 16:00)', waiter: 'Jan K.' },
  { id: '2', date: '2026-05-10', shift: 'Zmiana Popołudniowa (16:00 - 00:00)', waiter: 'Marta W.' },
  { id: '3', date: '2026-05-11', shift: 'Zmiana Poranna (8:00 - 16:00)', waiter: 'Jan K. (Ty)' },
];

export const WAITERS_LIST = ['Jan K.', 'Marta W.', 'Anna Z.', 'Piotr R.'];
export const CURRENT_CLIENT_NAME = 'Jan Kowalski';

// Kolory statusów
export const STATUS_COLORS = {
  free: 'bg-green-100 border-green-500 text-green-800',
  occupied: 'bg-red-100 border-red-500 text-red-800',
  reserved: 'bg-yellow-100 border-yellow-500 text-yellow-800'
} as const;

// Shift types
export const SHIFTS = [
  'Zmiana Poranna (8:00 - 16:00)',
  'Zmiana Popołudniowa (16:00 - 00:00)'
];
