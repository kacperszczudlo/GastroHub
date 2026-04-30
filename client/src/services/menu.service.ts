import apiService from './api.service';
import { MenuItem } from '../types';
import { MenuModel } from '../models';

class MenuService {
  async getAll(): Promise<MenuItem[]> {
    try {
      const response = await apiService.getClient().get('/menu');
      const items = Array.isArray(response.data) ? response.data : (response.data.items || []);
      return items.map((item: any) => MenuModel.fromAPI(item));
    } catch (error) {
      console.error('Error fetching menu:', error);
      throw error;
    }
  }

  async getById(id: string): Promise<MenuItem> {
    try {
      const response = await apiService.getClient().get(`/menu/${id}`);
      return MenuModel.fromAPI(response.data.data || response.data);
    } catch (error) {
      console.error('Error fetching menu item:', error);
      throw error;
    }
  }

  async create(item: Omit<MenuItem, 'id'>): Promise<MenuItem> {
    try {
      const response = await apiService.getClient().post('/menu', MenuModel.toAPI(item as MenuItem));
      return MenuModel.fromAPI(response.data.data || response.data);
    } catch (error) {
      console.error('Error creating menu item:', error);
      throw error;
    }
  }

  async update(id: string, item: MenuItem): Promise<MenuItem> {
    try {
      const response = await apiService.getClient().put(`/menu/${id}`, MenuModel.toAPI(item));
      return MenuModel.fromAPI(response.data.data || response.data);
    } catch (error) {
      console.error('Error updating menu item:', error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await apiService.getClient().delete(`/menu/${id}`);
    } catch (error) {
      console.error('Error deleting menu item:', error);
      throw error;
    }
  }
}

export default new MenuService();
