import apiService from './api.service';

class AuthService {
  async login(email: string, password: string): Promise<string> {
    const response = await apiService.getClient().post('/auth/login', { email, password });
    return response.data?.token;
  }

  async register(email: string, password: string): Promise<void> {
    await apiService.getClient().post('/auth/register', { email, password });
  }

  async changePassword(email: string, oldPassword: string, newPassword: string): Promise<void> {
    await apiService.getClient().post('/auth/change-password', { email, oldPassword, newPassword });
  }

  async getWaiters(): Promise<Array<{ _id: string; email: string }>> {
    const response = await apiService.getClient().get('/auth/waiters');
    return response.data?.waiters || [];
  }
}

export default new AuthService();
