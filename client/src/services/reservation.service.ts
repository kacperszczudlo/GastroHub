import apiService from './api.service';
import type { Reservation } from '../types';
import { ReservationModel } from '../models';
import { getAxiosErrorPayload } from '../utils/errors';

function asObject(value: unknown): Record<string, unknown> {
  if (typeof value === 'object' && value !== null) {
    return value as Record<string, unknown>;
  }
  return {};
}

class ReservationService {
  async getAll(): Promise<Reservation[]> {
    try {
      const response = await apiService.getClient().get('/reservations');
      const reservations = Array.isArray(response.data)
        ? response.data
        : (response.data.reservations || []);
      return reservations.map((item: unknown) => ReservationModel.fromAPI(item));
    } catch (error) {
      console.error('Error fetching reservations:', error);
      throw error;
    }
  }

  async getMine(): Promise<Reservation[]> {
    try {
      const response = await apiService.getClient().get('/reservations/mine');
      const reservations = Array.isArray(response.data)
        ? response.data
        : (response.data.reservations || []);
      return reservations.map((item: unknown) => ReservationModel.fromAPI(item));
    } catch (error) {
      console.error('Error fetching own reservations:', error);
      throw error;
    }
  }

  async create(reservation: Omit<Reservation, 'id'>): Promise<Reservation> {
    try {
      const response = await apiService
        .getClient()
        .post('/reservations', ReservationModel.toAPI(reservation as Reservation));
      const rawReservation: unknown = response.data?.data || response.data;

      try {
        return ReservationModel.fromAPI(rawReservation);
      } catch (mappingError) {
        console.warn('Reservation created but response mapping failed:', mappingError);
        const r = asObject(rawReservation);
        return {
          id: String(r.id ?? r._id ?? `temp-${Date.now()}`),
          date: reservation.date,
          time: reservation.time,
          guests: reservation.guests,
          status: 'pending',
          tableId: null,
          clientName: reservation.clientName
        };
      }
    } catch (error) {
      console.error('Error creating reservation:', error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await apiService.getClient().delete(`/reservations/${id}/`);
    } catch (error) {
      console.error('Error deleting reservation:', error);
      throw error;
    }
  }

  async hardDelete(id: string): Promise<void> {
    try {
      await apiService.getClient().delete(`/reservations/${id}/hard`);
    } catch (error) {
      console.error('Error hard-deleting reservation:', error);
      throw error;
    }
  }

  async prune(days = 90): Promise<void> {
    try {
      await apiService.getClient().post('/reservations/prune', { days });
    } catch (error) {
      console.error('Error pruning reservations:', error);
      throw error;
    }
  }

  async update(id: string, payload: { status: 'accepted' | 'rejected' | 'pending' | 'cancelled' }): Promise<Reservation> {
    try {
      const response = await apiService.getClient().patch(`/reservations/${id}`, payload);
      return ReservationModel.fromAPI(response.data.data || response.data);
    } catch (error) {
      const status = getAxiosErrorPayload(error).status;
      if (status === 404) {
        try {
          const refreshed = await this.getAll();
          const found = refreshed.find(item => item.id === id);
          if (found) return found;
        } catch {
          void 0;
        }
      }

      console.error('Error updating reservation:', error);
      throw error;
    }
  }

  async checkIn(id: string): Promise<Reservation> {
    try {
      const response = await apiService.getClient().post(`/reservations/${id}/check-in`);
      return ReservationModel.fromAPI(response.data.data || response.data);
    } catch (error) {
      console.error('Error checking in reservation:', error);
      throw error;
    }
  }

  async complete(id: string): Promise<Reservation> {
    try {
      const response = await apiService.getClient().post(`/reservations/${id}/complete`);
      return ReservationModel.fromAPI(response.data.data || response.data);
    } catch (error) {
      console.error('Error completing reservation:', error);
      throw error;
    }
  }
}

export default new ReservationService();
