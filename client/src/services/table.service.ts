import apiService from './api.service';
import { Table } from '../types';
import { TableModel } from '../models';

class TableService {
  async getAll(): Promise<Table[]> {
    try {
      const response = await apiService.getClient().get('/tables');
      const tables = Array.isArray(response.data) ? response.data : (response.data.tables || []);
      return tables.map((item: any) => TableModel.fromAPI(item));
    } catch (error) {
      console.error('Error fetching tables:', error);
      throw error;
    }
  }

  async getById(id: string): Promise<Table> {
    try {
      const response = await apiService.getClient().get(`/tables/${id}`);
      return TableModel.fromAPI(response.data.data || response.data);
    } catch (error) {
      console.error('Error fetching table:', error);
      throw error;
    }
  }

  async create(table: Omit<Table, 'id'>): Promise<Table> {
    try {
      const response = await apiService.getClient().post('/tables', TableModel.toAPI(table as Table));
      return TableModel.fromAPI(response.data.data || response.data);
    } catch (error) {
      console.error('Error creating table:', error);
      throw error;
    }
  }

  async update(id: string, table: Table): Promise<Table> {
    try {
      const response = await apiService.getClient().put(`/tables/${id}/`, TableModel.toAPI(table));
      return TableModel.fromAPI(response.data.data || response.data);
    } catch (error) {
      console.error('Error updating table:', error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await apiService.getClient().delete(`/tables/${id}/`);
    } catch (error) {
      console.error('Error deleting table:', error);
      throw error;
    }
  }

  // Admin: aktualizacja pozycji na mapie
  async updatePosition(id: string, x: number, y: number): Promise<Table> {
    return this.update(id, await this.getById(id).then(t => ({ ...t, x, y })));
  }

  // Przypisanie kelnera do stolika
  async assignWaiter(id: string, waiter: string | null): Promise<Table> {
    return this.update(id, await this.getById(id).then(t => ({ ...t, waiter })));
  }
}

export default new TableService();
