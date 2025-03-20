import { EnterQueueResType, QueueStatusResType, GameIdType, GameResType, GameSinglePlayerResType, GameResultResType } from '@types';

import { api } from './api';

interface QueueResponse {
  queue_id: string;
  status: string;
}

interface GameIDResponse {
  game_id: string;
  status: string;
}

export async function enterQueue(mode: string) {
  try {
    const userID = localStorage.getItem('userID');
    if (!userID) {
      throw new Error('User ID not found');
    }
    const res = await api.post<EnterQueueResType>(`/matchmaking/enterQueue/${userID}?mode=${mode}`);
    console.log(res.data);
    return res.data;
  } catch (err) {
    console.error('Failed to join game:', err);
    throw err;
  }
}

export async function cancelQueue() {
  try {
    const userID = localStorage.getItem('userID');
    if (!userID) {
      throw new Error('User ID not found');
    }
    const res = await api.delete<CanPlayTypeResult>(`/matchmaking/cancel/${userID}`);
    console.log(res.data);
    return res.data;
  } catch (err) {
    console.error('Failed to cancel queue:', err);
    throw err;
  }
}

export async function getQueueStatus() {
  try {
    const userID = localStorage.getItem('userID');
    if (!userID) {
      throw new Error('User ID not found');
    }
    const res = await api.get<QueueStatusResType>(`/matchmaking/status/${userID}`);
    console.log(res.data);
    return res.data.status;
  } catch (err) {
    console.error('Failed to get game status:', err);
    throw err;
  }
}

export async function getGameID() {
  try {
    const userID = localStorage.getItem('userID');
    if (!userID) {
      throw new Error('User ID not found');
    }
    const res = await api.get<GameIdType>(`/game/getGameID/${userID}`);
    console.log(res);
    return res.data;
  } catch (err) {
    console.error('Failed to get game ID:', err);
    throw err;
  }
}

interface GameObject {
  game_id: string;
  player1_id: string;
  player2_id: string;
  player1_score: number;
  player2_score: number;
  winner_id: string;
  loser_id: string;
}

export async function getGame(game_id: string) {
  try {
    const res = await api.get<GameResType>(`/game/getGame/${game_id}`);
    console.log(res);
    return res.data;
  } catch (err) {
    console.error('Failed to get game:', err);
    throw err;
  }
}

export async function singlePlayer(difficulty: string) {
  try {
    const userID = localStorage.getItem('userID');
    if (!userID) {
      throw new Error('User ID not found');
    }
    const res = await api.post<GameSinglePlayerResType>(
      `/game/singlePlayer/${userID}?difficulty=${difficulty}`
    );
    console.log(res.data);
    return res.data;
  } catch (err) {
    console.error('Failed to join single player game:', err);
    throw err;
  }
}

interface GameResult {
  game_id: string;
  winner_id: string;
  loser_id: string;
  winner_score: number;
  loser_score: number;
}

export async function submitResult({
  game_id,
  winner_id,
  loser_id,
  winner_score,
  loser_score,
}: GameResult) {
  try {
    console.log(game_id, winner_id, loser_id, winner_score, loser_score);
    const res = await api.post<GameResultResType>(`/game/result`, {
      game_id,
      winner_id,
      loser_id,
      winner_score,
      loser_score,
    });
    if (res.status !== 200) {
      throw new Error(`Error ${res.status}: Failed to submit result`);
    }
    return res.data;
  } catch (err) {
    console.error('Failed to submit result:', err);
    throw err;
  }
}
