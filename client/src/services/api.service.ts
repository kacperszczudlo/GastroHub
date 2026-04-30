import axios, { AxiosInstance } from 'axios';
import { API_BASE_URL } from '../constants';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Interceptor do dodawania tokenu, jeśli mamy autentykację
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Interceptor do obsługi błędów
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user_role');
          if (window.location.pathname !== '/') {
            window.location.href = '/';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  getClient() {
    return this.api;
  }

  setAuthToken(token: string) {
    localStorage.setItem('auth_token', token);
    this.api.defaults.headers.common.Authorization = `Bearer ${token}`;
  }

  clearAuthToken() {
    localStorage.removeItem('auth_token');
    delete this.api.defaults.headers.common.Authorization;
  }
}

export default new ApiService();
