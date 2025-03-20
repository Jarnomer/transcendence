import { Static, Type } from '@sinclair/typebox';

export const UserRequestSchema = Type.Object({
  user_id: Type.String(),
});

export const UserResponseSchema = Type.Object({
  user_id: Type.String(),
  display_name: Type.String(),
  first_name: Type.String(),
  last_name: Type.String(),
  bio: Type.String(),
  avatar_url: Type.String(),
  status: Type.String(),
});

export const AllResponseRankSchema = Type.Array(
  Type.Object({
    user_id: Type.String(),
    display_name: Type.String(),
    first_name: Type.String(),
    last_name: Type.String(),
    bio: Type.String(),
    avatar_url: Type.String(),
    status: Type.String(),
    wins: Type.Number(),
    rank: Type.Number(),
  })
);

export const UserNotificationSchema = Type.Array(
  Type.Object({
    notification_id: Type.String(),
    user_id: Type.String(),
    type: Type.String(),
    reference_id: Type.String(),
    seen: Type.Boolean(),
  })
);

export const AllResponseSchema = Type.Array(UserResponseSchema);

export const UserUpdateSchema = Type.Object({
  display_name: Type.Optional(Type.String()),
  first_name: Type.Optional(Type.String()),
  last_name: Type.Optional(Type.String()),
  bio: Type.Optional(Type.String()),
  avatar_url: Type.Optional(Type.String()),
  status: Type.Optional(Type.String()),
});

export const UserDataResponseSchema = Type.Object({
  avatar_url: Type.String(),
  bio: Type.String(),
  display_name: Type.String(),
  first_name: Type.String(),
  friend_requests: Type.Array(
    Type.Object({
      user_id: Type.String(),
      display_name: Type.String(),
      status: Type.String(),
      avatar_url: Type.String(),
    })
  ),
  friends: Type.Array(
    Type.Object({
      user_id: Type.String(),
      display_name: Type.String(),
      status: Type.String(),
      avatar_url: Type.String(),
    })
  ),
  games: Type.Array(
    Type.Object({
      ended_at: Type.String(),
      game_id: Type.String(),
      my_score: Type.Number(),
      started_at: Type.String(),
      status: Type.String(),
      vsplayer: Type.Object({
        avatar_url: Type.String(),
        display_name: Type.String(),
        is_winner: Type.Boolean(),
        score: Type.Number(),
        user_id: Type.String(),
      }),
    })
  ),
  last_name: Type.String(),
  stats: Type.Object({
    wins: Type.Number(),
    losses: Type.Number(),
  }),
  status: Type.String(),
  user_id: Type.String(),
  username: Type.String(),
});

export type UserDataResponseType = Static<typeof UserDataResponseSchema>;
export type UserUpdateType = Static<typeof UserUpdateSchema>;
export type AllResponseRankType = Static<typeof AllResponseRankSchema>;
export type UserResponseType = Static<typeof UserResponseSchema>;
export type UserRequestType = Static<typeof UserRequestSchema>;
export type AllResponseType = Static<typeof AllResponseSchema>;
export type UserNotificationType = Static<typeof UserNotificationSchema>;
