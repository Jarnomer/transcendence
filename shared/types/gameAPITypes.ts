import { Static, Type } from '@sinclair/typebox';

export const GameIdSchema = Type.Object({
  game_id: Type.String(),
});

export const GameResSchema = Type.Object({
  game_id: Type.String(),
  start_time: Type.String(),
  end_time: Type.String(),
  status: Type.String(),
  players: Type.Array(
    Type.Object({
      user_id: Type.String(),
      display_name: Type.String(),
      avatar_url: Type.String(),
    })
  ),
});

export const GameReqSchema = Type.Object({
  game_id: Type.String(),
});

export const GameResultReqSchema = Type.Object({
  game_id: Type.String(),
  winner_id: Type.String(),
  loser_id: Type.String(),
  winner_score: Type.Number(),
  loser_score: Type.Number(),
});
export const GameResultResSchema = Type.Object({
  status: Type.String(),
});

export const GameSinglePlayerReqSchema = Type.Object({
  difficulty: Type.String(),
});

export const GameSinglePlayerResSchema = Type.Object({
  game_id: Type.String(),
  status: Type.String(),
});

export type GameSinglePlayerResType = Static<typeof GameSinglePlayerResSchema>;
export type GameSinglePlayerReqType = Static<typeof GameSinglePlayerReqSchema>;
export type GameResultResType = Static<typeof GameResultResSchema>;
export type GameResultReqType = Static<typeof GameResultReqSchema>;
export type GameReqType = Static<typeof GameReqSchema>;
export type GameResType = Static<typeof GameResSchema>;
export type GameIdType = Static<typeof GameIdSchema>;
