import apiService from './api.service';
import type { UserRole } from '../types';

const DEMO_PASSWORD = 'GastroHub123!';

class AuthService {
  private getDemoEmail(role: Exclude<UserRole, null>): string {
    return `demo.${role}@gastrohub.local`;
  }

  async login(email: string, password: string): Promise<string> {
    const response = await apiService.getClient().post('/auth/login', { email, password });
    return response.data?.token;
  }

  async register(email: string, password: string, role: Exclude<UserRole, null>): Promise<void> {
    await apiService.getClient().post('/auth/register', { email, password, role });
  }

  async loginAsDemoRole(role: Exclude<UserRole, null>): Promise<string> {
    const email = this.getDemoEmail(role);

    try {
      return await this.login(email, DEMO_PASSWORD);
    } catch {
      await this.register(email, DEMO_PASSWORD, role);
      return await this.login(email, DEMO_PASSWORD);
    }
  }
}

export default new AuthService();
