import type { MenuItem, Table, Reservation, Schedule } from '../types';

function asRecord(value: unknown): Record<string, unknown> {
  if (typeof value === 'object' && value !== null) {
    return value as Record<string, unknown>;
  }
  return {};
}

function readId(d: Record<string, unknown>): string {
  return String(d.id ?? d._id ?? '');
}

export class MenuModel {
  static fromAPI(data: unknown): MenuItem {
    const d = asRecord(data);
    return {
      id: readId(d),
      name: String(d.name ?? ''),
      category: String(d.category ?? ''),
      price: Number(d.price ?? 0),
      image: String(d.image ?? ''),
      desc: String(d.description || 'Brak opisu'),
    };
  }

  static toAPI(item: MenuItem): Record<string, unknown> {
    return {
      name: item.name,
      category: item.category,
      price: item.price,
      image: item.image,
      description: item.desc,
    };
  }
}

export class TableModel {
  static fromAPI(data: unknown): Table {
    const d = asRecord(data);
    const statusMap: Record<string, Table['status']> = {
      available: 'free',
      occupied: 'occupied',
      reserved: 'reserved',
    };

    const rawOrderId = d.orderId;
    let orderId: string | null = null;
    if (rawOrderId != null && rawOrderId !== '') {
      if (typeof rawOrderId === 'object') {
        const o = asRecord(rawOrderId);
        const inner = o._id ?? o.id ?? rawOrderId;
        orderId = inner != null ? String(inner) : null;
      } else {
        orderId = String(rawOrderId);
      }
    }

    return {
      id: readId(d),
      number: Number(d.number ?? d.tableNumber ?? 0),
      seats: Number(d.seats ?? d.capacity ?? 0),
      status: statusMap[String(d.status)] || 'free',
      x: Number(d.x ?? 0),
      y: Number(d.y ?? 0),
      waiter: d.waiter == null ? null : String(d.waiter),
      orderId,
    };
  }

  static toAPI(table: Table): Record<string, unknown> {
    const statusMap: Record<Table['status'], string> = {
      free: 'available',
      occupied: 'occupied',
      reserved: 'reserved',
    };

    return {
      tableNumber: table.number,
      capacity: table.seats,
      status: statusMap[table.status],
      x: table.x,
      y: table.y,
      waiter: table.waiter,
      orderId: table.orderId || null,
    };
  }
}

export class ReservationModel {
  static fromAPI(data: unknown): Reservation {
    const d = asRecord(data);
    const statusMap: Record<string, Reservation['status']> = {
      pending: 'pending',
      accepted: 'accepted',
      active: 'active',
      completed: 'completed',
      rejected: 'rejected',
      cancelled: 'cancelled',
    };

    const dateSource = d.date ?? d.reservationDate;
    const parsedDate = dateSource ? new Date(String(dateSource)) : null;
    const normalizedDate =
      parsedDate && !Number.isNaN(parsedDate.getTime())
        ? parsedDate.toISOString().slice(0, 10)
        : typeof dateSource === 'string'
          ? dateSource.slice(0, 10)
          : '';

    const tableRaw = d.tableId;
    let tableId: string | null = null;
    if (tableRaw != null && tableRaw !== '') {
      if (typeof tableRaw === 'object') {
        const t = asRecord(tableRaw);
        const inner = t._id ?? t.id;
        tableId = inner != null ? String(inner) : null;
      } else {
        tableId = String(tableRaw);
      }
    }

    const user = asRecord(d.userId);
    const clientFromUser = user.email != null ? String(user.email) : '';

    return {
      id: readId(d),
      date: normalizedDate,
      time: String(d.time || d.startTime || ''),
      guests: Number(d.guests ?? d.numberOfGuests ?? 0),
      status: statusMap[String(d.status)] || 'pending',
      tableId,
      clientName: String(d.clientName || d.client_name || clientFromUser || 'Klient'),
    };
  }

  static toAPI(reservation: Reservation): Record<string, unknown> {
    const [h = '18', m = '00'] = reservation.time.split(':');
    const endHour = String((Number(h) + 2) % 24).padStart(2, '0');

    return {
      reservationDate: reservation.date,
      startTime: reservation.time,
      endTime: `${endHour}:${m}`,
      numberOfGuests: reservation.guests,
      clientName: reservation.clientName,
    };
  }
}

export class ScheduleModel {
  static fromAPI(data: unknown): Schedule {
    const d = asRecord(data);
    return {
      id: readId(d) || String(Date.now()),
      _id: d._id != null ? String(d._id) : d.id != null ? String(d.id) : undefined,
      date: String(d.date ?? ''),
      shift: String(d.shift ?? ''),
      waiter: String(d.waiter ?? ''),
    };
  }

  static toAPI(schedule: Schedule): Record<string, unknown> {
    return {
      date: schedule.date,
      shift: schedule.shift,
      waiter: schedule.waiter,
    };
  }
}
