import { api } from './api';

export async function getUserData(userId: string) {
  try {
    if (!userId) {
      throw new Error('User ID not provided');
    }
    const res = await api.get(`/user/data/${userId}`);
    if (res.status !== 200) {
      throw new Error(`Error ${res.status}: Failed to fetch user data`);
    }
    console.log('user data', res.data);
    return res.data;
  } catch (err) {
    console.error('Failed to get user data:', err);
    throw err;
  }
}

export async function getUsers() {
  try {
    const res = await api.get(`/user/all`);
    if (res.status !== 200) {
      throw new Error(`Error ${res.status}: Failed to fetch user data`);
    }
    return res.data;
  } catch (err) {
    console.error('Failed to get user list:', err);
    throw err;
  }
}
// page = page number, pageSize = number of items per page
export async function getUsersInQueue() {
  try {
    const res = await api.get(`/matchmaking/all?page=1&pageSize=10`);
    if (res.status !== 200) {
      throw new Error(`Error ${res.status}: Failed to fetch users in queue`);
    }
    return res.data;
  } catch (err) {
    console.error('Failed to get users in queue:', err);
    throw err;
  }
}

export async function getUserImage() {
  try {
    const userID = localStorage.getItem('userID');
    if (!userID) {
      throw new Error('User ID not found');
    }
    const res = await api.get(
      `/user/avatar/${userID}`,
      { responseType: 'blob' } // Important for binary data
    );
    if (res.status !== 200) {
      throw new Error(`Error ${res.status}: Failed to fetch user image`);
    }
    return res.data;
  } catch (err) {
    console.error('Failed to get user image:', err);
    throw err;
  }
}
