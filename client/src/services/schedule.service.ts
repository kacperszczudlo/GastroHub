import apiService from './api.service';

class ScheduleService {
  async getByWaiter(waiterEmail: string): Promise<any[]> {
    try {
      const response = await apiService.getClient().get(`/schedules/waiter?waiter=${waiterEmail}`);
      return response.data?.schedules || [];
    } catch (error) {
      console.error('Error fetching schedule:', error);
      throw error;
    }
  }

  async getAll(): Promise<any[]> {
    try {
      const response = await apiService.getClient().get('/schedules');
      return response.data?.schedules || [];
    } catch (error) {
      console.error('Error fetching all schedules:', error);
      throw error;
    }
  }

  async create(schedule: { waiter: string; date: string; shift: 'morning' | 'afternoon' | 'evening' }): Promise<any> {
    try {
      const response = await apiService.getClient().post('/schedules', schedule);
      return response.data?.data || response.data;
    } catch (error) {
      console.error('Error creating schedule:', error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await apiService.getClient().delete(`/schedules/${id}`);
    } catch (error) {
      console.error('Error deleting schedule:', error);
      throw error;
    }
  }

  async update(id: string, payload: Partial<{ status: string; shift: string; date: string }>): Promise<any> {
    try {
      const response = await apiService.getClient().put(`/schedules/${id}`, payload);
      return response.data?.data || response.data;
    } catch (error) {
      console.error('Error updating schedule:', error);
      throw error;
    }
  }
}

export default new ScheduleService();
