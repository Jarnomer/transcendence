import { api } from '@services';

export async function getPublicChat() {
  try {
    const res = await api.get(`/chat/public`);
    if (res.status !== 200) {
      throw new Error(`Error ${res.status}: Failed to get chat history`);
    }
    return res.data;
  } catch (err) {
    console.error('Failed to get chat history:', err);
    throw err;
  }
}

export async function getChat(room_id: string) {
  try {
    const res = await api.get(`/chat/${room_id}`);
    if (res.status !== 200) {
      throw new Error(`Error ${res.status}: Failed to get chat`);
    }
    return res.data;
  } catch (err) {
    console.error('Failed to get chat:', err);
    throw err;
  }
}

export async function getMyRooms() {
  try {
    const res = await api.get(`/chat/my-rooms`);
    if (res.status !== 200) {
      throw new Error(`Error ${res.status}: Failed to get chat rooms`);
    }
    return res.data;
  } catch (err) {
    console.error('Failed to get chat rooms:', err);
    throw err;
  }
}

export async function getDm(receiver_id: string) {
  try {
    const res = await api.get(`/chat/dm/${receiver_id}`);
    if (res.status !== 200) {
      throw new Error(`Error ${res.status}: Failed to get direct messages`);
    }
    return res.data;
  } catch (err) {
    console.error('Failed to get direct messages:', err);
    throw err;
  }
}

export async function createChatRoom(name: string, type: string) {
  try {
    const res = await api.post(`/chat/create`, { name, type });
    if (res.status >= 400) {
      throw new Error(`Error ${res.status}: Failed to create chat room`);
    }
    return res.data;
  } catch (err) {
    console.error('Failed to create chat room:', err);
    throw err;
  }
}

export async function addMember(room_id: string, members: Array<string>) {
  try {
    const res = await api.post(`/chat/addMember`, { room_id, members });
    if (res.status >= 400) {
      throw new Error(`Error ${res.status}: Failed to add member`);
    }
    return res.data;
  } catch (err) {
    console.error('Failed to add member:', err);
    throw err;
  }
}
