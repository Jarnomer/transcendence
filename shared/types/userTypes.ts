import { Static, Type } from '@sinclair/typebox';

export const UserIdSchema = Type.Object({
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
    losses: Type.Number(),
    elo: Type.Number(),
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
  email: Type.Optional(Type.String()),
});

export const UserDataResponseSchema = Type.Object({
  avatar_url: Type.String(),
  bio: Type.String(),
  display_name: Type.String(),
  first_name: Type.String(),
  email: Type.Optional(Type.String()),
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
    rank: Type.Number(),
    rating: Type.Number(),
  }),
  status: Type.String(),
  user_id: Type.String(),
  username: Type.String(),
});

export const SessionStatusSchema = Type.Object({
  game_session: Type.Optional(Type.Boolean()),
  queue_session: Type.Optional(Type.Boolean()),
});

export const UserFriendsSchema = Type.Array(
  Type.Object({
    user_id: Type.String(),
    display_name: Type.String(),
    status: Type.String(),
    avatar_url: Type.String(),
  })
);

export const BlockedUserSchema = Type.Object({
  user_id: Type.String(),
  display_name: Type.String(),
  avatar_url: Type.String(),
  username: Type.String(),
});

export const BlockedUserSchemaArray = Type.Array(BlockedUserSchema);

export type BlockedUserType = Static<typeof BlockedUserSchema>;
export type BlockedUserArrayType = Static<typeof BlockedUserSchemaArray>;
export type UserFriendsType = Static<typeof UserFriendsSchema>;
export type SessionStatusType = Static<typeof SessionStatusSchema>;
export type UserDataResponseType = Static<typeof UserDataResponseSchema>;
export type UserUpdateType = Static<typeof UserUpdateSchema>;
export type AllResponseRankType = Static<typeof AllResponseRankSchema>;
export type UserResponseType = Static<typeof UserResponseSchema>;
export type UserIdType = Static<typeof UserIdSchema>;
export type AllResponseType = Static<typeof AllResponseSchema>;
export type UserNotificationType = Static<typeof UserNotificationSchema>;

export type FriendListType = Static<typeof UserDataResponseSchema>['friends'];
export type FriendType = Static<typeof UserDataResponseSchema>['friends'][number];
