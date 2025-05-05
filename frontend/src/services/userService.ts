import {
  AllResponseRankType,
  AllResponseType,
  GameAudioOptions,
  GameSettings,
  QueueResType,
  UserDataResponseType,
  UserNotificationType,
  UserResponseType,
} from '@shared/types';

import { api } from './api';

export async function getUserData(userId: string) {
  try {
    if (!userId) {
      throw new Error('User ID not provided');
    }
    const res = await api.get<UserDataResponseType>(`/user/data/${userId}`);
    if (res.status !== 200) {
      throw new Error(`Error ${res.status}: Failed to fetch user data`);
    }
    // console.log('user data', res.data);
    return res.data;
  } catch (err) {
    console.error('Failed to get user data:', err);
    throw err;
  }
}

export async function getUsers() {
  try {
    const res = await api.get<AllResponseType>(`/user/all`);
    // console.log(res);
    if (res.status !== 200) {
      throw new Error(`Error ${res.status}: Failed to fetch user data`);
    }
    return res.data;
  } catch (err) {
    console.error('Failed to get user list:', err);
    throw err;
  }
}

export async function getUsersWithRank() {
  try {
    const res = await api.get<AllResponseRankType>(`/user/all/rank`);
    if (res.status !== 200) {
      throw new Error(`Error ${res.status}: Failed to fetch user data with rank`);
    }
    return res.data;
  } catch (err) {
    console.error('Failed to get user list with rank:', err);
    throw err;
  }
}
// page = page number, pageSize = number of items per page
export async function getUsersInQueue() {
  try {
    const res = await api.get<QueueResType>(`/matchmaking/all?page=1&pageSize=10`);
    if (res.status !== 200) {
      throw new Error(`Error ${res.status}: Failed to fetch users in queue`);
    }
    return res.data;
  } catch (err) {
    console.error('Failed to get users in queue:', err);
    throw err;
  }
}

export async function getTournaments() {
  try {
    const res = await api.get(`/matchmaking/tournaments?page=1&pageSize=10`);
    if (res.status !== 200) {
      throw new Error(`Error ${res.status}: Failed to fetch tournaments`);
    }
    return res.data;
  } catch (err) {
    console.error('Failed to get tournaments:', err);
    throw err;
  }
}

export async function getUserImage() {
  try {
    const res = await api.get<UserResponseType>(
      `/user/avatar`,
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

export async function getNotifications() {
  try {
    const res = await api.get<UserNotificationType>(`/user/notifications`);
    return res.data;
  } catch (err) {
    console.error('Failed to get notifications:', err);
    throw err;
  }
}

export async function markNotificationAsSeen(notificationID: string) {
  try {
    const res = await api.post(`/user/notification/seen/${notificationID}`);
    if (res.status !== 200) {
      throw new Error(`Error ${res.status}: Failed to mark notification as seen`);
    }
    return res.data;
  } catch (err) {
    console.error('Failed to mark notification as seen:', err);
    throw err;
  }
}

export async function getUserByID(userID: string) {
  try {
    const res = await api.get<UserResponseType>(`/user/${userID}`);
    if (res.status !== 200) {
      throw new Error(`Error ${res.status}: Failed to fetch user`);
    }
    return res.data;
  } catch (err) {
    console.error('Failed to get user:', err);
    throw err;
  }
}

interface UpdateUserType {
  display_name: string;
  first_name: string;
  last_name: string;
  bio: string;
  avatar_url: string;
  status: string;
}

export async function updateUser(data: Partial<UpdateUserType>) {
  try {
    const userID = localStorage.getItem('userID');
    const res = await api.patch<UserResponseType>(`/user/${userID}`, data);
    if (res.status !== 200) {
      throw new Error(`Error ${res.status}: Failed to update user`);
    }
    return res.data;
  } catch (err) {
    console.error('Failed to update user:', err);
    throw err;
  }
}

export async function saveGameSettings(settings: GameSettings) {
  try {
    delete settings.mode;
    delete settings.difficulty;
    console.log('Saving game settings for user:', settings);
    const res = await api.post(`/user/saveGameSettings`, settings);
    console.log(res.data);
    return res.data;
  } catch (err) {
    console.error('Failed to save game settings:', err);
    throw err;
  }
}

export async function getGameSettings() {
  try {
    const res = await api.get<GameSettings>(`/user/getGameSettings`);
    if (res.status !== 200) {
      throw new Error(`Error ${res.status}: Failed to fetch game settings`);
    }
    return res.data;
  } catch (err) {
    console.error('Failed to get game settings:', err);
    throw err;
  }
}

export async function saveAudioSettings(settings: GameAudioOptions) {
  try {
    console.log('Saving audio settings for user:', settings);
    const res = await api.post<GameAudioOptions>(`/user/audio-settings`, settings);
    if (res.status !== 200) {
      throw new Error(`Error ${res.status}: Failed to save audio settings`);
    }
    return res.data;
  } catch (err) {
    console.error('Failed to save audio settings:', err);
    throw err;
  }
}

export async function getAudioSettings() {
  try {
    const res = await api.get<GameAudioOptions>(`/user/audio-settings`);
    if (res.status !== 200) {
      throw new Error(`Error ${res.status}: Failed to fetch audio settings`);
    }
    return res.data;
  } catch (err) {
    console.error('Failed to get audio settings:', err);
    throw err;
  }
}
