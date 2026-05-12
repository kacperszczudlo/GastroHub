import type { MenuItem, Table, Reservation, Schedule } from '../types';

export class MenuModel {
  static fromAPI(data: any): MenuItem {
    return {
      id: data.id?.toString() || data._id?.toString(),
      name: data.name,
      category: data.category,
      price: data.price,
      image: data.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
      desc: data.description || 'Brak opisu',
    };
  }

  static toAPI(item: MenuItem): any {
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
  static fromAPI(data: any): Table {
    const statusMap: Record<string, Table['status']> = {
      available: 'free',
      occupied: 'occupied',
      reserved: 'reserved',
    };

    return {
      id: (data.id || data._id || '').toString(),
      number: Number(data.number ?? data.tableNumber ?? 0),
      seats: Number(data.seats ?? data.capacity ?? 0),
      status: statusMap[data.status] || 'free',
      x: data.x || 0,
      y: data.y || 0,
      waiter: data.waiter || null,
      orderId: (data.orderId?._id || data.orderId || null)?.toString?.() || null,
    };
  }

  static toAPI(table: Table): any {
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
  static fromAPI(data: any): Reservation {
    const statusMap: Record<string, Reservation['status']> = {
      pending: 'pending',
      accepted: 'accepted',
      active: 'active',
      completed: 'completed',
      rejected: 'rejected',
      cancelled: 'cancelled',
    };

    const dateSource = data.date || data.reservationDate;
    const parsedDate = dateSource ? new Date(dateSource) : null;
    const normalizedDate =
      parsedDate && !Number.isNaN(parsedDate.getTime())
        ? parsedDate.toISOString().slice(0, 10)
        : typeof dateSource === 'string'
          ? dateSource.slice(0, 10)
          : '';

    return {
      id: (data.id || data._id || '').toString(),
      date: normalizedDate,
      time: data.time || data.startTime || '',
      guests: Number(data.guests ?? data.numberOfGuests ?? 0),
      status: statusMap[data.status] || 'pending',
      tableId: data.tableId?._id?.toString?.() || data.tableId?.toString?.() || null,
      clientName: data.clientName || data.client_name || data.userId?.email || 'Klient',
    };
  }

  static toAPI(reservation: Reservation): any {
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
  static fromAPI(data: any): Schedule {
    return {
      id: (data.id || data._id || Date.now()).toString(),
      _id: data._id?.toString?.() || data.id?.toString?.(),
      date: data.date,
      shift: data.shift,
      waiter: data.waiter,
    };
  }

  static toAPI(schedule: Schedule): any {
    return {
      date: schedule.date,
      shift: schedule.shift,
      waiter: schedule.waiter,
    };
  }
}
