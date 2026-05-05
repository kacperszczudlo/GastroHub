// Rola użytkownika w systemie
export type UserRole = 'client' | 'waiter' | 'admin' | null;

// Widok/strona w systemie
export type ViewType = 
  | 'menu' 
  | 'reservation' 
  | 'client_reservations' 
  | 'floor' 
  | 'pos' 
  | 'schedule' 
  | 'admin_dashboard' 
  | 'admin_reservations' 
  | 'admin_menu';

// Status stolika
export type TableStatus = 'free' | 'occupied' | 'reserved';

// Status rezerwacji
export type ReservationStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled';

// Interfejs Menu Item
export interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  desc: string;
}

// Interfejs Stolika
export interface Table {
  id: string;
  number: number;
  seats: number;
  status: TableStatus;
  x: number;
  y: number;
  waiter: string | null;
  orderId?: string | null;
}

// Interfejs Rezerwacji
export interface Reservation {
  id: string;
  date: string;
  time: string;
  guests: number;
  status: ReservationStatus;
  tableId: string | null;
  clientName: string;
}

// Interfejs Grafiku Pracy
export interface Schedule {
  id: string;
  _id?: string;
  date: string;
  shift: string;
  waiter: string;
}

// Zamówienie w POS (koszyk)
export interface OrderItem extends MenuItem {
  qty: number;
}
