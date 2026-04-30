import React, { createContext, useContext, useState } from 'react';
import type { UserRole } from '../types';
import authService from '../services/auth.service';
import apiService from '../services/api.service';

interface AuthContextType {
  role: UserRole;
  login: (role: Exclude<UserRole, null>) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<UserRole>(
    (localStorage.getItem('user_role') as UserRole) || null
  );

  const login = async (newRole: Exclude<UserRole, null>) => {
    const token = await authService.loginAsDemoRole(newRole);
    apiService.setAuthToken(token);
    setRole(newRole);
    localStorage.setItem('user_role', newRole || '');
  };

  const logout = () => {
    setRole(null);
    localStorage.removeItem('user_role');
    localStorage.removeItem('auth_token');
  };

  return (
    <AuthContext.Provider value={{ role, login, logout }}>
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
