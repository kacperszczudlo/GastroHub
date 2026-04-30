import apiService from './api.service';
import { Schedule } from '../types';
import { ScheduleModel } from '../models';

class ScheduleService {
  async getAll(): Promise<Schedule[]> {
    try {
      const response = await apiService.getClient().get('/schedule');
      return response.data.map((item: any) => ScheduleModel.fromAPI(item));
    } catch (error) {
      console.error('Error fetching schedules:', error);
      throw error;
    }
  }

  async getByWaiter(waiter: string): Promise<Schedule[]> {
    try {
      const response = await apiService.getClient().get('/schedule', {
        params: { waiter }
      });
      return response.data.map((item: any) => ScheduleModel.fromAPI(item));
    } catch (error) {
      console.error('Error fetching waiter schedule:', error);
      throw error;
    }
  }

  async create(schedule: Omit<Schedule, 'id'>): Promise<Schedule> {
    try {
      const response = await apiService.getClient().post('/schedule', ScheduleModel.toAPI(schedule as Schedule));
      return ScheduleModel.fromAPI(response.data);
    } catch (error) {
      console.error('Error creating schedule:', error);
      throw error;
    }
  }

  async update(id: number, schedule: Schedule): Promise<Schedule> {
    try {
      const response = await apiService.getClient().put(`/schedule/${id}`, ScheduleModel.toAPI(schedule));
      return ScheduleModel.fromAPI(response.data);
    } catch (error) {
      console.error('Error updating schedule:', error);
      throw error;
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await apiService.getClient().delete(`/schedule/${id}`);
    } catch (error) {
      console.error('Error deleting schedule:', error);
      throw error;
    }
  }
}

export default new ScheduleService();
