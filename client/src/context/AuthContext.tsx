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
      const resData: any = res.data;
      const user = resData?.data?.user || resData?.user || (resData?.data && !resData.data.user && resData.data.id ? resData.data : null);
      if (user && (user.id || user._id || user.email)) {
        setUser({
          id: user.id || user._id,
          _id: user._id || user.id,
          name: user.name || 'User',
          email: user.email || '',
          role: user.role || 'user',
          isBlocked: Boolean(user.isBlocked),
          avatar: user.avatar,
          preferences: user.preferences || { theme: 'system', emailNotifications: false }
        });
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
    const resData: any = res.data;

    // Resilient parsing: accepts { data: { user } }, { user }, or { data: user }
    const user = resData?.data?.user || resData?.user || (resData?.data && !resData.data.user && resData.data.id ? resData.data : null);
    const token = resData?.data?.token || resData?.token;

    if (user && (user.id || user._id || user.email)) {
      if (token) {
        localStorage.setItem('token', token);
      }
      const normalizedUser: IUser = {
        id: user.id || user._id,
        _id: user._id || user.id,
        name: user.name || 'User',
        email: user.email || '',
        role: user.role || 'user',
        isBlocked: Boolean(user.isBlocked),
        avatar: user.avatar,
        preferences: user.preferences || { theme: 'system', emailNotifications: false }
      };
      setUser(normalizedUser);
      return normalizedUser;
    }

    const message = resData?.message || resData?.error || 'Failed to retrieve user data upon sign in.';
    throw new Error(message);
  };

  const register = async (name: string, email: string, password: string): Promise<IUser> => {
    const res = await api.register({ name, email, password });
    const resData: any = res.data;

    const user = resData?.data?.user || resData?.user || (resData?.data && !resData.data.user && resData.data.id ? resData.data : null);
    const token = resData?.data?.token || resData?.token;

    if (user && (user.id || user._id || user.email)) {
      if (token) {
        localStorage.setItem('token', token);
      }
      const normalizedUser: IUser = {
        id: user.id || user._id,
        _id: user._id || user.id,
        name: user.name || name,
        email: user.email || email,
        role: user.role || 'user',
        isBlocked: Boolean(user.isBlocked),
        avatar: user.avatar,
        preferences: user.preferences || { theme: 'system', emailNotifications: false }
      };
      setUser(normalizedUser);
      return normalizedUser;
    }

    const message = resData?.message || resData?.error || 'Failed to complete user registration.';
    throw new Error(message);
  };

  const googleLogin = async (email: string, name?: string, avatar?: string): Promise<IUser> => {
    const res = await api.googleAuth({ email, name, avatar });
    const resData: any = res.data;

    const user = resData?.data?.user || resData?.user || (resData?.data && !resData.data.user && resData.data.id ? resData.data : null);
    const token = resData?.data?.token || resData?.token;

    if (user && (user.id || user._id || user.email)) {
      if (token) {
        localStorage.setItem('token', token);
      }
      const normalizedUser: IUser = {
        id: user.id || user._id,
        _id: user._id || user.id,
        name: user.name || name || 'User',
        email: user.email || email,
        role: user.role || 'user',
        isBlocked: Boolean(user.isBlocked),
        avatar: user.avatar || avatar,
        preferences: user.preferences || { theme: 'system', emailNotifications: false }
      };
      setUser(normalizedUser);
      return normalizedUser;
    }

    const message = resData?.message || resData?.error || 'Google authentication failed.';
    throw new Error(message);
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
