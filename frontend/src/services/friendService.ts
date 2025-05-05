import { api } from '@services';

import { MessageResponseType, RequestResponseType, SentResponseType } from '@shared/types';

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
    // console.log(res.data);
    return res.data;
  } catch (err) {
    console.error('Failed to get sent friend requests:', err);
    throw err;
  }
}

export async function getReceivedFriendRequests() {
  try {
    const res = await api.get<RequestResponseType>(`/friend/requests/received`);
    if (res.status !== 200) {
      throw new Error(`Error ${res.status}: Failed to get received friend requests`);
    }
    return res.data;
  } catch (err) {
    console.error('Failed to get received friend requests:', err);
    throw err;
  }
}

export async function getBlockedUsers() {
  try {
    const res = await api.get(`/friend/blocked`);
    if (res.status !== 200) {
      throw new Error(`Error ${res.status}: Failed to get blocked users`);
    }
    return res.data;
  } catch (err) {
    console.error('Failed to get blocked users:', err);
    throw err;
  }
}

export async function getMyfriends() {
  try {
    const res = await api.get(`/friend/friends`);
    if (res.status !== 200) {
      throw new Error(`Error ${res.status}: Failed to get friends`);
    }
    return res.data;
  } catch (err) {
    console.error('Failed to get friends:', err);
    throw err;
  }
}

export async function blockUser(blocked_user_id: string) {
  try {
    const res = await api.post(`/friend/block/${blocked_user_id}`, {
      message: 'User blocked',
    });
    if (res.status !== 200) {
      throw new Error(`Error ${res.status}: Failed to block user`);
    }
    return res.data;
  } catch (err) {
    console.error('Failed to block user:', err);
    throw err;
  }
}

export async function unblockUser(blocked_user_id: string) {
  try {
    const res = await api.delete(`/friend/block/${blocked_user_id}`);
    if (res.status !== 200) {
      throw new Error(`Error ${res.status}: Failed to unblock user`);
    }
    return res.data;
  } catch (err) {
    console.error('Failed to unblock user:', err);
    throw err;
  }
}

export async function getAmIBlockedBy(blocker_user_id: string) {
  try {
    const res = await api.get(`/friend/block/${blocker_user_id}`);
    if (res.status !== 200) {
      throw new Error(`Error ${res.status}: Failed to get blocked users`);
    }
    return res.data;
  } catch (err) {
    console.error('Failed to get blocked users:', err);
    throw err;
  }
}
