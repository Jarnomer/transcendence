import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

import { SessionManager, api, getRequestsSent, getUserData } from '@services';

import { FriendListType, UserDataResponseType } from '@shared/types';

interface FriendRequest {
  user_id: string;
  receiver_id: string;
  status: string;
}

interface UserContextType {
  userId: string | null;
  user: UserDataResponseType | null;
  setUser: React.Dispatch<React.SetStateAction<UserDataResponseType | null>>;
  sentRequests: FriendRequest[];
  refetchUser: () => void;
  refetchRequests: () => void;
  checkAuth: () => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  friends: FriendListType;
  // setToken: React.Dispatch<React.SetStateAction<string | null>>;
}

const cleanLocalStorage = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('userID');
  localStorage.removeItem('username');
  localStorage.removeItem('game-session');
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within a UserProvider');
  return context;
};

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserDataResponseType | null>(null);
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState<boolean>(true);
  const userId = localStorage.getItem('userID');

  useEffect(() => {
    if (!user) return;
    const sessionManager = SessionManager.getInstance();
    sessionManager.set('avatarUrl', user.avatar_url);
    sessionManager.set('displayName', user.username);
    sessionManager.set('userId', user.user_id);
  }, [user]);

  const fetchUser = useCallback(() => {
    const userId = localStorage.getItem('userID');
    if (!userId) {
      setUser(null);
      return;
    }
    getUserData(userId)
      .then((data) => {
        setUser(data);
        setFriends(data.friends);
        // console.log('Fetched user data:', data);
      })
      .catch((err) => {
        console.error('Failed to fetch user data', err);
        cleanLocalStorage();
        setUser(null);
      });
  }, [userId]);

  const fetchRequestsSent = useCallback(() => {
    if (!userId) return;
    getRequestsSent()
      .then((data) => setSentRequests(data))
      .catch((err) => console.error('Failed to fetch sent friend requests:', err));
  }, [userId]);

  // const fetchRequestsReceived = useCallback(() => {
  //   if (!userId) return;
  //   getReceivedFriendRequests()
  //     .then((data) => {
  //       setMyFriendRequests(data);
  //     })
  //     .catch((err) => console.error('Failed to fetch received friend requests:', err));
  // }, [userId]);

  // const fetchBlockedUsers = useCallback(() => {
  //   if (!userId) return;
  //   getBlockedUsers()
  //     .then((data) => {
  //       setMyBlockedUsers(data);
  //     })
  //     .catch((err) => console.error('Failed to fetch blocked users:', err));
  // }, [userId]);

  // const fetchFriends = useCallback(() => {
  //   if (!userId) return;
  //   getMyfriends()
  //     .then((data) => {
  //       setMyFriends(data);
  //     })
  //     .catch((err) => console.error('Failed to fetch friends:', err));
  // }, [userId]);

  // const fetchMyGames = useCallback(() => {
  //   if (!userId) return;
  //   getMyGames()
  //     .then((data) => {
  //       setMyGames(data);
  //     })
  //     .catch((err) => console.error('Failed to fetch my games:', err));
  // }, [userId]);

  // const fetchMyStats = useCallback(() => {
  //   if (!userId) return;
  //   getMyStats()
  //     .then((data) => {
  //       setMyStats(data);
  //     })
  //     .catch((err) => console.error('Failed to fetch my stats:', err));
  // }, [userId]);

  const checkAuth = async () => {
    console.log('checking auth');
    setLoading(true);
    const token = localStorage.getItem('token');
    console.log('token', token);
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
      // fetchRequestsReceived();
      // fetchBlockedUsers();
      // fetchFriends();
      // fetchMyGames();
      // fetchMyStats();
    } catch (error) {
      setUser(null);
      cleanLocalStorage();
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
        await api.patch(`/user/${userId}`, { status: 'offline' });
        await api.post('/auth/logout', { user_id: userId });
      }
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      cleanLocalStorage();
      setUser(null);
      window.location.href = '/login';
    }
  };

  // useEffect(() => {
  //   console.log('UserContext mounted');
  //   fetchUser();
  //   fetchRequestsSent();
  //   fetchRequestsReceived();
  //   fetchBlockedUsers();
  //   fetchFriends();
  //   fetchMyGames();
  //   fetchMyStats();
  // }, [
  //   fetchUser,
  //   fetchRequestsSent,
  //   fetchRequestsReceived,
  //   fetchBlockedUsers,
  //   fetchFriends,
  //   fetchMyGames,
  //   fetchMyStats,
  // ]);

  return (
    <UserContext.Provider
      value={{
        userId,
        user,
        setUser,
        sentRequests,
        refetchUser: fetchUser,
        checkAuth,
        logout,
        refetchRequests: fetchRequestsSent,
        loading,
        friends,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
