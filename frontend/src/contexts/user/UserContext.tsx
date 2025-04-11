import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

import { getUserData } from '@/services/userService';

import { UserDataResponseType } from '@shared/types/userTypes';

import { api } from '../../services/api';
import { getRequestsSent } from '../../services/friendService';

interface FriendRequest {
  user_id: string;
  receiver_id: string;
  status: string;
}

interface UserContextType {
  user: UserDataResponseType | null;
  setUser: React.Dispatch<React.SetStateAction<UserDataResponseType | null>>;
  sentRequests: FriendRequest[];
  refetchUser: () => void;
  refetchRequests: () => void;
  checkAuth: () => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within a UserProvider');
  return context;
};

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserDataResponseType | null>(null);
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const userId = localStorage.getItem('userID');

  const fetchUser = useCallback(() => {
    const userId = localStorage.getItem('userID');
    if (!userId) {
      setUser(null);
      return;
    }
    console.log('Fetching user data in UserContext...');
    console.log(userId);
    getUserData(userId)
      .then((data) => {
        setUser(data);
        console.log('Fetched user data:', data);
      })
      .catch((err) => {
        console.error('Failed to fetch user data', err);
        localStorage.removeItem('token');
        localStorage.removeItem('userID');
        localStorage.removeItem('username');
        setUser(null);
      });
  }, []);

  const fetchRequestsSent = useCallback(() => {
    if (!userId) return;
    getRequestsSent()
      .then((data) => setSentRequests(data))
      .catch((err) => console.error('Failed to fetch sent friend requests:', err));
  }, [userId]);

  const checkAuth = async () => {
    console.log('checking auth');
    setLoading(true);
    const token = localStorage.getItem('token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await api.get('/auth/validate');
      localStorage.setItem('userID', res.data.user_id);
      localStorage.setItem('username', res.data.username);
      fetchUser();
      fetchRequestsSent();
    } catch (error) {
      localStorage.removeItem('token');
      localStorage.removeItem('userID');
      localStorage.removeItem('username');
      setUser(null);
      setLoading(false);
    } finally {
      setLoading(false);
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
    fetchRequestsSent();
  }, [fetchUser, fetchRequestsSent]);

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        sentRequests,
        refetchUser: fetchUser,
        checkAuth,
        logout,
        refetchRequests: fetchRequestsSent,
        loading,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
