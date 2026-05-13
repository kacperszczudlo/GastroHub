import axios, { AxiosInstance } from 'axios';
import { API_BASE_URL } from '../constants';

class ApiService {
  private api: AxiosInstance;
  private authToken: string | null = null;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    this.api.interceptors.request.use((config) => {
      if (this.authToken) {
        config.headers.Authorization = `Bearer ${this.authToken}`;
      }
      return config;
    });

    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          this.clearAuthToken();
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
    this.authToken = token;
    this.api.defaults.headers.common.Authorization = `Bearer ${token}`;
  }

  clearAuthToken() {
    this.authToken = null;
    delete this.api.defaults.headers.common.Authorization;
  }
}

export default new ApiService();
