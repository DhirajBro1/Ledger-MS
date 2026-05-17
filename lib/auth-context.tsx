import React, { createContext, useContext, useEffect, useState } from 'react';
import { authStore, AuthUser } from '@/lib/auth-store';

interface AuthContextType {
  token: string | null;
  user: AuthUser | null;
  isLoading: boolean;
  register: (apiBaseUrl: string, name: string, email: string, password: string, confirmPassword: string) => Promise<void>;
  login: (apiBaseUrl: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing auth on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { token: savedToken, user: savedUser } = await authStore.getAuth();
        setToken(savedToken);
        setUser(savedUser);
      } catch (error) {
        console.error('Error checking auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const register = async (apiBaseUrl: string, name: string, email: string, password: string, confirmPassword: string) => {
    try {
      const { token: newToken, user: newUser } = await authStore.register(
        apiBaseUrl,
        name,
        email,
        password,
        confirmPassword
      );
      setToken(newToken);
      setUser(newUser);
    } catch (error) {
      throw error;
    }
  };

  const login = async (apiBaseUrl: string, email: string, password: string) => {
    try {
      const { token: newToken, user: newUser } = await authStore.login(apiBaseUrl, email, password);
      setToken(newToken);
      setUser(newUser);
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authStore.logout();
      setToken(null);
      setUser(null);
    } catch (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ token, user, isLoading, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
