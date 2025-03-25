import {
  GameIdType,
  GameResType,
  GameResultReqType,
  GameResultResType,
  GameSinglePlayerResType,
  QueueStatusResType,
} from '@types';

import { api } from './api';

export async function enterQueue(mode: string, difficulty: string) {
  try {
    const res = await api.post<QueueStatusResType>(
      `/matchmaking/enterQueue?mode=${mode}&difficulty=${difficulty}`
    );
    console.log(res.data);
    return res.data;
  } catch (err) {
    console.error('Failed to join game:', err);
    throw err;
  }
}

export async function cancelQueue() {
  try {
    const res = await api.delete<CanPlayTypeResult>(`/matchmaking/cancel`);
    console.log(res.data);
    return res.data;
  } catch (err) {
    console.error('Failed to cancel queue:', err);
    throw err;
  }
}

export async function joinQueue(queueID: string) {
  try {
    const res = await api.post<QueueStatusResType>(`/matchmaking/join1v1/${queueID}`);
    console.log(res.data);
    return res.data;
  } catch (err) {
    console.error('Failed to join queue:', err);
    throw err;
  }
}
export async function getQueueStatus() {
  try {
    const res = await api.get<QueueStatusResType>(`/matchmaking/status`);
    console.log(res.data);
    return res.data.status;
  } catch (err) {
    console.error('Failed to get game status:', err);
    throw err;
  }
}

export async function getGameID() {
  try {
    const res = await api.get<GameIdType>(`/game/getGameID`);
    console.log(res);
    return res.data;
  } catch (err) {
    console.error('Failed to get game ID:', err);
    throw err;
  }
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
    const res = await api.post<GameSinglePlayerResType>(
      `/game/singlePlayer?difficulty=${difficulty}`
    );
    console.log(res.data);
    return res.data;
  } catch (err) {
    console.error('Failed to join single player game:', err);
    throw err;
  }
}

export async function submitResult({
  game_id,
  winner_id,
  loser_id,
  winner_score,
  loser_score,
}: GameResultReqType) {
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
