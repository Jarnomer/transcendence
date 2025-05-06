import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

import { toast } from 'react-hot-toast';

import { addMember, createChatRoom, getChat, getDm, getMyRooms, getPublicChat } from '@/services';

import { useUser, useWebSocketContext } from '@contexts';

import { MessageNotification } from '@components/chat';

import { ChatMessageType, ChatRoomType, FriendListType } from '@shared/types';

const ChatContext = createContext<any>(null);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { chatSocket, sendMessage } = useWebSocketContext();
  const { user } = useUser();

  const [friends, setFriends] = useState<FriendListType>([]);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Record<string, ChatMessageType[]>>({});
  const [rooms, setRooms] = useState<ChatRoomType[]>([]);
  const [myRooms, setMyRooms] = useState<ChatRoomType[]>([]);
  const [openChatWindows, setOpenChatWindows] = useState<Record<string, boolean>>({});
  // const playMessageSound = useSound('/sounds/effects/message.wav');

  const roomIdRef = useRef(roomId);

  useEffect(() => {
    console.log('ChatProvider mounted');
    return () => {
      console.log('ChatProvider unmounted');
    };
  }, []);

  useEffect(() => {
    if (user) {
      setFriends(user.friends);
    }
  }, [user]);

  useEffect(() => {
    roomIdRef.current = roomId;
  }, [roomId]);

  const fetchDmHistory = async (friendId: string) => {
    try {
      const data = (await getDm(friendId)) as any;
      console.log('Fetched DM history:', data);
      setMessages((prev) => ({
        ...prev,
        [friendId]: data,
      }));
      return data;
    } catch (error) {
      console.error('Failed to fetch DM history:', error);
    }
  };

  const fetchChatHistory = async (roomId: string) => {
    try {
      const data = (await getChat(roomId)) as any;
      console.log('Fetched chat history:', data);
      setMessages((prev) => ({
        ...prev,
        [roomId]: data,
      }));
      return data;
    } catch (error) {
      console.error('Failed to fetch chat history:', error);
    }
  };

  const handleNotificationClick = (senderId: string) => {
    setOpenChatWindows((prev) => ({ ...prev, [senderId]: true }));
    // openModal('chatModal', {
    //   user,
    //   friends,
    //   selectedFriendId: senderId,
    //   onsend: sendChatMessage,
    //   messages,
    // });
  };

  const notifyMessage = (event: MessageEvent) => {
    console.log(event);
    const isCurrentRoom = roomIdRef.current && event.room_id === roomIdRef.current;
    if (isCurrentRoom || openChatWindows[event.sender_id] || openChatWindows[event.room_id]) return;
    const chatId = event.room_id ? event.room_id : event.sender_id;
    const isGroupChat = event.room_id ? true : false;
    const foundRoom = rooms.find((room) => room.chat_room_id === event.room_id);
    const groupChatName = isGroupChat && foundRoom ? foundRoom.name : null;

    console.log('rooms: ', rooms, 'myRooms: ', myRooms);
    console.log('event room id: ', event.room_id);
    console.log(isGroupChat, groupChatName);
    // playMessageSound();
    toast.custom((t) => (
      <MessageNotification>
        <div
          className="h-full w-full flex items-center glass-box"
          onClick={() => handleNotificationClick(chatId)}
        >
          <div className="h-full aspect-square p-2">
            <img
              className="object-contain h-full w-full border-1"
              src={event.avatar_url || './src/assets/images/default_avatar.png'}
            />
          </div>
          <div className="text-xs">
            {event.room_id &&
              rooms &&
              rooms.find((room) => room.chat_room_id === event.room_id) && (
                <span>{rooms.find((room) => room.chat_room_id === event.room_id).name}</span>
              )}
            <p className="text-xs">{event.display_name}</p>
            <p className="text-xs">{event.message}</p>
          </div>
        </div>
      </MessageNotification>
    ));
  };

  const handleChatMessage = (event: MessageEvent) => {
    console.log('handling chat message');
    if (event.room_id) {
      setMessages((prev) => ({
        ...prev,
        [event.room_id]: [...(prev[event.room_id] || []), event],
      }));
      if (!messages[event.room_id]) {
        fetchChatHistory(event.room_id);
      }
    }

    if (event.sender_id) {
      setMessages((prev) => ({
        ...prev,
        [event.sender_id]: [...(prev[event.sender_id] || []), event],
      }));

      // Lazy load DM history if not already fetched
      if (!messages[event.sender_id]) {
        fetchDmHistory(event.sender_id);
      }
    }

    notifyMessage(event);
  };

  useEffect(() => {
    chatSocket.addEventListener('message', handleChatMessage);
    return () => chatSocket.removeEventListener('message', handleChatMessage);
  }, []);

  useEffect(() => {
    if (!user) return;
    getPublicChat()
      .then(setRooms)
      .catch((err) => console.error('Failed to fetch public chat rooms:', err));
  }, [user]);

  useEffect(() => {
    const userId = localStorage.getItem('userID');
    if (!userId) return;
    getMyRooms()
      .then(setMyRooms)
      .catch((err) => console.error('Failed to fetch my chat rooms:', err));
  }, []);

  useEffect(() => {
    if (roomId && !messages[roomId]) {
      fetchChatHistory(roomId);
    }
  }, [roomId]);

  const sendChatMessage = (
    selectedFriend: string | null,
    roomId: string | null,
    newMessage: string
  ) => {
    const userId = localStorage.getItem('userID');
    if (!userId || !(selectedFriend || roomId) || newMessage.trim() === '') return;

    const messageData = {
      type: selectedFriend ? 'dm' : 'room',
      payload: {
        sender_id: userId,
        avatar_url: user?.avatar_url,
        display_name: user?.display_name,
        receiver_id: selectedFriend,
        room_id: roomId,
        message: newMessage,
      },
    };

    sendMessage('chat', messageData);
    console.log('sending message: ', messageData);
    const key = selectedFriend || roomId;
    setMessages((prev) => ({
      ...prev,
      [key!]: [...(prev[key!] || []), messageData.payload],
    }));
  };

  const joinRoom = (id: string) => {
    const sender_id = user?.user_id;
    if (!sender_id) return;
    setRoomId(id);
    sendMessage('chat', {
      type: 'join',
      payload: { room_id: id, sender_id },
    });
  };

  const createRoom = async (roomName: string, isPrivate: boolean, memberList: string[]) => {
    const data = await createChatRoom(roomName, isPrivate ? 'private' : 'public');
    if (data) {
      await addMember(data.chat_room_id, memberList);
      setRooms((prev) => [...prev, data]);
      setRoomId(data.chat_room_id);
    }
    return data.chat_room_id;
  };

  return (
    <ChatContext.Provider
      value={{
        user,
        friends,
        messages,
        roomId,
        rooms,
        myRooms,
        setRoomId,
        sendChatMessage,
        joinRoom,
        createRoom,
        openChatWindows,
        setOpenChatWindows,
        fetchDmHistory,
        fetchChatHistory,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChatContext = () => useContext(ChatContext);
