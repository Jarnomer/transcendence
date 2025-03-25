import { Static, Type } from '@sinclair/typebox';

export const RequestSchema = Type.Object({
  receiver_id: Type.String(),
});
export const RequestResponseSchema = Type.Object({
  message: Type.String(),
});
export const SentResponseSchema = Type.Array(
  Type.Object({
    user_id: Type.String(),
    receiver_id: Type.String(),
    status: Type.String(),
    avatar_url: Type.String(),
  })
);

export const ReceivedResponseSchema = Type.Array(
  Type.Object({
    user_id: Type.String(),
    sender_id: Type.String(),
    status: Type.String(),
    avatar_url: Type.String(),
  })
);

export const AcceptSchema = Type.Object({
  sender_id: Type.String(),
});
export const RejectSchema = Type.Object({
  sender_id: Type.String(),
});
export const CancelSchema = Type.Object({
  receiver_id: Type.String(),
});
export const MessageResponseSchema = Type.Object({
  message: Type.String(),
});

export type SentResponseType = Static<typeof SentResponseSchema>;
export type ReceivedResonseType = Static<typeof ReceivedResponseSchema>;
export type RequestType = Static<typeof RequestSchema>;
export type RequestResponseType = Static<typeof RequestResponseSchema>;
export type AcceptType = Static<typeof AcceptSchema>;
export type RejectType = Static<typeof RejectSchema>;
export type CancelType = Static<typeof CancelSchema>;
export type MessageResponseType = Static<typeof MessageResponseSchema>;
