import apiService from './api.service';

interface Order {
  items: any[];
  totalPrice: number;
  tableId?: number;
}

class OrderService {
  async createOrder(order: Order): Promise<any> {
    try {
      const response = await apiService.getClient().post('/order', order);
      return response.data;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  async getOrderById(id: string): Promise<Order> {
    try {
      const response = await apiService.getClient().get(`/order/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching order:', error);
      throw error;
    }
  }

  async updateOrder(id: string, order: Order): Promise<Order> {
    try {
      const response = await apiService.getClient().put(`/order/${id}`, order);
      return response.data;
    } catch (error) {
      console.error('Error updating order:', error);
      throw error;
    }
  }
}

export default new OrderService();
