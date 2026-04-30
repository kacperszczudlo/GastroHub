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

  async create(reservation: Omit<Reservation, 'id'>): Promise<Reservation> {
    try {
      const response = await apiService
        .getClient()
        .post('/reservations', ReservationModel.toAPI(reservation as Reservation));
      return ReservationModel.fromAPI(response.data.data || response.data);
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
}

export default new ReservationService();
