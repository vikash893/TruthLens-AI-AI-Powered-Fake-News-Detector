import React, { createContext, useContext, useEffect, useState } from 'react';
import { IUser } from '../types';
import { api } from '../api/client';

interface AuthContextType {
  user: IUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<IUser>;
  register: (name: string, email: string, password: string) => Promise<IUser>;
  googleLogin: (email: string, name?: string, avatar?: string) => Promise<IUser>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => ({} as IUser),
  register: async () => ({} as IUser),
  googleLogin: async () => ({} as IUser),
  logout: async () => {},
  refreshUser: async () => {}
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchCurrentUser = async () => {
    try {
      const res = await api.getMe();
      if (res.data.success && res.data.data.user) {
        setUser(res.data.data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (email: string, password: string): Promise<IUser> => {
    const res = await api.login({ email, password });
    if (res.data.success && res.data.data.user) {
      if (res.data.data.token) {
        localStorage.setItem('token', res.data.data.token);
      }
      setUser(res.data.data.user);
      return res.data.data.user;
    }
    throw new Error('Failed to retrieve user data upon sign in.');
  };

  const register = async (name: string, email: string, password: string): Promise<IUser> => {
    const res = await api.register({ name, email, password });
    if (res.data.success && res.data.data.user) {
      if (res.data.data.token) {
        localStorage.setItem('token', res.data.data.token);
      }
      setUser(res.data.data.user);
      return res.data.data.user;
    }
    throw new Error('Failed to complete user registration.');
  };

  const googleLogin = async (email: string, name?: string, avatar?: string): Promise<IUser> => {
    const res = await api.googleAuth({ email, name, avatar });
    if (res.data.success && res.data.data.user) {
      if (res.data.data.token) {
        localStorage.setItem('token', res.data.data.token);
      }
      setUser(res.data.data.user);
      return res.data.data.user;
    }
    throw new Error('Google authentication failed.');
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (err) {
      // ignore
    } finally {
      localStorage.removeItem('token');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        googleLogin,
        logout,
        refreshUser: fetchCurrentUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
