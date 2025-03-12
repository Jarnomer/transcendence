import { api } from './api';

export async function sendFriendRequest(receiver_id: string) {
  try {
    const userID = localStorage.getItem('userID');
    if (!userID) {
      throw new Error('User ID not found');
    }
    const res = await api.post(`/friend/request`, { receiver_id });
    if (res.status !== 200) {
      throw new Error(`Error ${res.status}: Failed to send friend request`);
    }
    return res.data;
  } catch (err) {
    console.error('Failed to send friend request:', err);
    throw err;
  }
}

export async function acceptFriendRequest(sender_id: string) {
  try {
    const userID = localStorage.getItem('userID');
    if (!userID) {
      throw new Error('User ID not found');
    }
    const res = await api.post(`/friend/request/accept/${sender_id}`, {
      message: 'Friend request accepted',
    });
    if (res.status !== 200) {
      throw new Error(`Error ${res.status}: Failed to accept friend request`);
    }
    return res.data;
  } catch (err) {
    console.error('Failed to accept friend request:', err);
    throw err;
  }
}

export async function rejectFriendRequest(sender_id: string) {
  try {
    const userID = localStorage.getItem('userID');
    if (!userID) {
      throw new Error('User ID not found');
    }
    const res = await api.post(`/friend/request/reject/${sender_id}`, {
      message: 'Friend request rejected',
    });
    if (res.status !== 200) {
      throw new Error(`Error ${res.status}: Failed to reject friend request`);
    }
    return res.data;
  } catch (err) {
    console.error('Failed to reject friend request:', err);
    throw err;
  }
}
