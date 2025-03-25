import { Static, Type } from '@sinclair/typebox';

export const UserIdSchema = Type.Object({
  user_id: Type.String(),
});

export const QueueResSchema = Type.Object({
  queues: Type.Array(
    Type.Object({
      queue_id: Type.String(),
      mode: Type.String(),
      players: Type.Array(
        Type.Object({
          user_id: Type.String(),
          display_name: Type.String(),
          avatar_url: Type.String(),
          joined_at: Type.String(),
          status: Type.String(),
        })
      ),
    })
  ),
  pagination: Type.Object({
    page: Type.Number(),
    pageSize: Type.Number(),
    total: Type.Number(),
    totalPages: Type.Number(),
  }),
});

export const QueueStatusResSchema = Type.Object({
  queue_id: Type.String(),
  mode: Type.String(),
  status: Type.String(),
  joined_at: Type.String(),
});

export const CancelQueueResSchema = Type.Object({
  status: Type.String(),
});

export const EnterQueueReqSchema = Type.Object({
  mode: Type.String(),
});

export const EnterQueueResSchema = Type.Object({
  queue_id: Type.String(),
  mode: Type.String(),
});

export type QueueResType = Static<typeof QueueResSchema>;
export type QueueStatusResType = Static<typeof QueueStatusResSchema>;
export type UserIdType = Static<typeof UserIdSchema>;
export type CancelQueueResType = Static<typeof CancelQueueResSchema>;
export type EnterQueueReqType = Static<typeof EnterQueueReqSchema>;
export type EnterQueueResType = Static<typeof EnterQueueResSchema>;
