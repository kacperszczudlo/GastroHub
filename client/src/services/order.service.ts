import apiService from './api.service';
import type { OrderItem } from '../types';

type OrderPayload = {
  tableId: string | null;
  waiter?: string | null;
  items: Array<{ menuItemId: string; quantity: number }>;
};

class OrderService {
  async createOpenOrder(payload: OrderPayload): Promise<any> {
    try {
      const response = await apiService.getClient().post('/orders', payload);
      return response.data?.data || response.data;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  async getOpenOrders(): Promise<any[]> {
    try {
      const response = await apiService.getClient().get('/orders/status/open');
      return response.data?.orders || [];
    } catch (error) {
      console.error('Error fetching open orders:', error);
      throw error;
    }
  }

  async getOpenOrderByTable(tableId: string): Promise<any | null> {
    try {
      const response = await apiService.getClient().get('/orders/open', {
        params: { tableId }
      });
      return response.data?.data || null;
    } catch (error) {
      console.error('Error fetching open order:', error);
      throw error;
    }
  }

  async completeOrder(orderId: string): Promise<any> {
    try {
      const response = await apiService.getClient().post(`/orders/${orderId}/complete`);
      return response.data?.data || response.data;
    } catch (error) {
      console.error('Error completing order:', error);
      throw error;
    }
  }

  mapToPayload(items: OrderItem[]) {
    return items.map(item => ({
      menuItemId: item.id,
      quantity: item.qty
    }));
  }
}

export default new OrderService();
