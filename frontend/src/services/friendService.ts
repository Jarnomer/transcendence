import { MessageResponseType, RequestResponseType, SentResponseType } from '@shared/types';

import { api } from './api';

export async function sendFriendRequest(receiver_id: string) {
  try {
    const res = await api.post<RequestResponseType>(`/friend/request/${receiver_id}`);
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
    const res = await api.post<MessageResponseType>(`/friend/request/accept/${sender_id}`, {
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
    const res = await api.post<MessageResponseType>(`/friend/request/reject/${sender_id}`, {
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

export async function getRequestsSent() {
  try {
    const res = await api.get<SentResponseType>(`/friend/requests/sent`);
    if (res.status !== 200) {
      throw new Error(`Error ${res.status}: Failed to get sent friend requests`);
    }
    console.log(res.data);
    return res.data;
  } catch (err) {
    console.error('Failed to get sent friend requests:', err);
    throw err;
  }
}
