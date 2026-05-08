import apiService from './api.service';
import { Reservation } from '../types';
import { ReservationModel } from '../models';

class ReservationService {
  async getAll(): Promise<Reservation[]> {
    try {
      const response = await apiService.getClient().get('/reservations');
      const reservations = Array.isArray(response.data)
        ? response.data
        : (response.data.reservations || []);
      return reservations.map((item: any) => ReservationModel.fromAPI(item));
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
      return reservations.map((item: any) => ReservationModel.fromAPI(item));
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
      const rawReservation = response.data?.data || response.data;

      try {
        return ReservationModel.fromAPI(rawReservation);
      } catch (mappingError) {
        // Reservation is already persisted on backend - fallback prevents false "send failed" UI.
        console.warn('Reservation created but response mapping failed:', mappingError);
        return {
          id: (rawReservation?.id || rawReservation?._id || `temp-${Date.now()}`).toString(),
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
      console.error('Error updating reservation:', error);
      throw error;
    }
  }

  // Mark an accepted reservation as "klient przybył" (active).
  async checkIn(id: string): Promise<Reservation> {
    try {
      const response = await apiService.getClient().post(`/reservations/${id}/check-in`);
      return ReservationModel.fromAPI(response.data.data || response.data);
    } catch (error) {
      console.error('Error checking in reservation:', error);
      throw error;
    }
  }

  // Manually finish an "active" reservation - frees the table without
  // requiring a paid order (e.g. customer left without ordering).
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
