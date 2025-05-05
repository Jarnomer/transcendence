import { Static, Type } from '@sinclair/typebox';

export const ChatRoomSchema = Type.Object({
  chat_room_id: Type.String(),
  created_at: Type.String(),
  created_by: Type.String(),
  name: Type.String(),
  type: Type.String(),
});

// Define a schema for a single chat message
export const ChatMessageSchema = Type.Object({
  direct_messages_id: Type.String(),
  sender_id: Type.String(),
  receiver_id: Type.String(),
  avatar_url: Type.String(),
  created_at: Type.String(),
  display_name: Type.String(),
  message: Type.String(),
});

// Define a schema for the response containing an array of chat messages
export const ChatMessagesResponseSchema = Type.Array(ChatMessageSchema);

// Define a type for a single chat message
export type ChatMessageType = Static<typeof ChatMessageSchema>;

// Define a type for an array of chat messages
export type ChatMessagesResponseType = Static<typeof ChatMessagesResponseSchema>;

// Define a schema for the response containing an array of chat rooms
export const ChatRoomsResponseSchema = Type.Array(ChatRoomSchema);
// Define a type for a single chat room
export type ChatRoomType = Static<typeof ChatRoomSchema>;
// Define a type for an array of chat rooms
export type ChatRoomsResponseType = Static<typeof ChatRoomsResponseSchema>;
