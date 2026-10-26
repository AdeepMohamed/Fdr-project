import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { authApi } from '../services/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  theme: 'dark' | 'light';
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  switchDemoRole: (roleKey: 'admin' | 'official' | 'college1' | 'college2') => Promise<void>;
  toggleTheme: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('fdr_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('fdr_theme') as 'dark' | 'light') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('fdr_theme', theme);
  }, [theme]);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('fdr_access_token');
      if (token) {
        try {
          const userData = await authApi.getMe();
          setUser(userData);
          localStorage.setItem('fdr_user', JSON.stringify(userData));
        } catch (e) {
          console.warn('Session expired or invalid:', e);
          setUser(null);
          localStorage.removeItem('fdr_access_token');
          localStorage.removeItem('fdr_user');
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const data = await authApi.login({ email, password });
      localStorage.setItem('fdr_access_token', data.access);
      localStorage.setItem('fdr_refresh_token', data.refresh);
      setUser(data.user);
      localStorage.setItem('fdr_user', JSON.stringify(data.user));
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('fdr_access_token');
    localStorage.removeItem('fdr_refresh_token');
    localStorage.removeItem('fdr_user');
    setUser(null);
  };

  const switchDemoRole = async (roleKey: 'admin' | 'official' | 'college1' | 'college2') => {
    const credentials = {
      admin: { email: 'admin@aicte.gov.in', password: 'Admin@123' },
      official: { email: 'official@aicte.gov.in', password: 'Official@123' },
      college1: { email: 'director@delhitech.edu.in', password: 'College@123' },
      college2: { email: 'principal@mitpune.edu.in', password: 'College@123' },
    }[roleKey];

    await login(credentials.email, credentials.password);
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        theme,
        login,
        logout,
        switchDemoRole,
        toggleTheme,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
