export type UserRole = 'client' | 'waiter' | 'admin' | null;

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

export type TableStatus = 'free' | 'occupied' | 'reserved';

/** pending → awaiting staff; accepted → confirmed; active → guest seated; completed → finished; rejected/cancelled → closed without service */
export type ReservationStatus =
  | 'pending'
  | 'accepted'
  | 'active'
  | 'completed'
  | 'rejected'
  | 'cancelled';

export interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  desc: string;
}

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

export interface Reservation {
  id: string;
  date: string;
  time: string;
  guests: number;
  status: ReservationStatus;
  tableId: string | null;
  clientName: string;
}

export interface Schedule {
  id: string;
  _id?: string;
  date: string;
  shift: string;
  waiter: string;
}

export interface OrderItem extends MenuItem {
  qty: number;
}

/** Menu reference as returned on embedded order lines */
export type OpenOrderMenuRef =
  | string
  | {
      _id?: string;
      name?: string;
      category?: string;
      price?: number;
      image?: string;
      description?: string;
    };

export interface OpenOrderLineItem {
  menuItemId?: OpenOrderMenuRef;
  name?: string;
  price?: number;
  image?: string;
  desc?: string;
  quantity?: number;
}

export type OpenOrderTableId =
  | string
  | number
  | { _id?: string | { toString(): string }; id?: string };

/** Open order document from `/orders` API */
export interface OpenOrder {
  _id?: string;
  id?: string;
  tableId?: OpenOrderTableId;
  items?: OpenOrderLineItem[];
}
