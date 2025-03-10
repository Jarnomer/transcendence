import { useState, useContext } from 'react';
import { api } from './services/api.ts';
import { IsLoggedInContext } from './app';

 const isLoggedInContext = useContext(IsLoggedInContext)!;
const { setIsLoggedIn} = isLoggedInContext;
  
export const logout = async () => {
  try {
    await api.post('/auth/logout', { user_id: localStorage.getItem('userID') });
    await api.patch(`/user/${localStorage.getItem('userID')}`, { status: 'offline' });
  } catch (error) {
    console.error('Logout failed:', error);
  } finally {
    localStorage.removeItem('token');
    localStorage.removeItem('userID');
    localStorage.removeItem('username');
    setIsLoggedIn(false);
    console.log('logged out');
    window.location.href = '/login';
  }
};