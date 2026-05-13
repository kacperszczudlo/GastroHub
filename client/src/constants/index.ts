export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const SHIFTS = [
  { key: 'morning', label: 'Zmiana Poranna (8:00 - 16:00)' },
  { key: 'afternoon', label: 'Zmiana Popołudniowa (16:00 - 00:00)' },
];

export const STATUS_COLORS = {
  free: 'bg-green-100 border-green-500 text-green-800',
  occupied: 'bg-red-100 border-red-500 text-red-800',
  reserved: 'bg-yellow-100 border-yellow-500 text-yellow-800',
} as const;
