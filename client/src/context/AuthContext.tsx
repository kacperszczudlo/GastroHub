import React, { createContext, useContext, useEffect, useState } from 'react';
import type { UserRole } from '../types';
import authService from '../services/auth.service';
import apiService from '../services/api.service';

interface AuthContextType {
  role: UserRole;
  email: string | null;
  login: (email: string, password: string) => Promise<UserRole>;
  register: (email: string, password: string) => Promise<UserRole>;
  logout: () => void;
}

const AUTH_TOKEN_STORAGE_KEY = 'gastrohub_auth_token';

const decodeJwtPayload = (token: string): { role?: UserRole; email?: string } => {
  const payload = token.split('.')[1];
  if (!payload) {
    return {};
  }

  const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');

  try {
    return JSON.parse(atob(padded));
  } catch {
    return {};
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<UserRole>(null);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
    if (storedToken) {
      apiService.setAuthToken(storedToken);
      const payload = decodeJwtPayload(storedToken);
      setRole((payload.role as UserRole) || null);
      setEmail(payload.email || null);
    }
  }, []);

  const applySession = (token: string) => {
    localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
    apiService.setAuthToken(token);
    const payload = decodeJwtPayload(token);
    setRole((payload.role as UserRole) || null);
    setEmail(payload.email || null);
    return (payload.role as UserRole) || null;
  };

  const login = async (email: string, password: string) => {
    const token = await authService.login(email, password);
    return applySession(token);
  };

  const register = async (email: string, password: string) => {
    await authService.register(email, password);
    const token = await authService.login(email, password);
    return applySession(token);
  };

  const logout = () => {
    setRole(null);
    setEmail(null);
    localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    apiService.clearAuthToken();
  };

  return (
    <AuthContext.Provider value={{ role, email, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
