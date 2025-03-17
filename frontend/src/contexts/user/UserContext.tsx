import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

import { getUserData } from '@/services/userService';

import { api } from '../../services/api';

interface User {
  user_id: string;
  profile_id: string;
  username: string;
  display_name: string;
  avatar_url: string;
  status: string;
}

interface UserContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  refetchUser: () => void;
  checkAuth: () => Promise<void>;
  logout: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within a UserProvider');
  return context;
};

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const userId = localStorage.getItem('userID');

  const fetchUser = useCallback(() => {
    const userId = localStorage.getItem('userID');
    if (!userId) {
      setUser(null);
      return;
    }
    console.log('Fetching user data in UserContext...');
    getUserData(userId)
      .then((data) => {
        setUser(data);
        console.log('Fetched user data:', data);
      })
      .catch((err) => {
        console.error('Failed to fetch user data', err);
        setUser(null);
      });
  }, []);

  const checkAuth = async () => {
    console.log('checking auth');
    const token = localStorage.getItem('token');
    if (!token) {
      setUser(null);
      return;
    }

    try {
      const res = await api.get('/auth/validate');
      localStorage.setItem('userID', res.data.user_id);
      localStorage.setItem('username', res.data.username);
      await fetchUser();
    } catch (error) {
      console.error('Token validation failed:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('userID');
      setUser(null);
    }
  };

  const logout = async () => {
    console.log('logging out');
    try {
      const userId = user?.user_id || localStorage.getItem('userID');
      if (userId) {
        await api.post('/auth/logout', { user_id: userId });
        await api.patch(`/user/${userId}`, { status: 'offline' });
      }
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('userID');
      localStorage.removeItem('username');
      setUser(null);
      window.location.href = '/login';
    }
  };

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return (
    <UserContext.Provider value={{ user, setUser, refetchUser: fetchUser, checkAuth, logout }}>
      {children}
    </UserContext.Provider>
  );
};
