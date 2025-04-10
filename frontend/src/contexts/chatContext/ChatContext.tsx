import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

import { toast } from 'react-hot-toast';

import { useWebSocketContext } from '@/contexts/WebSocketContext';
import {
  addMember,
  createChatRoom,
  getChat,
  getDm,
  getMyRooms,
  getPublicChat,
} from '@/services/chatService';

import { MessageNotification } from '../../components/chat/MessageNotification';
import { useModal } from '../../contexts/modalContext/ModalContext';
import { useUser } from '../user/UserContext';

const ChatContext = createContext<any>(null);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { chatSocket, sendMessage, closeConnection, connections } = useWebSocketContext();

  const { user } = useUser();
  const [friends, setFriends] = useState<any[]>([]);
  const [selectedFriend, setSelectedFriend] = useState<string | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [myRooms, setMyRooms] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<any>();

  const roomIdRef = useRef(roomId);
  const selectedFriendRef = useRef(selectedFriend);
  const selectedRoomRef = useRef(selectedRoom);
  const { openModal } = useModal();

  useEffect(() => {
    if (!user) return;
    setFriends(user.friends);
  }, [user]);

  useEffect(() => {
    roomIdRef.current = roomId;
  }, [roomId]);

  useEffect(() => {
    selectedFriendRef.current = selectedFriend;
  }, [selectedFriend]);

  useEffect(() => {
    const userId = localStorage.getItem('userID');
    if (!userId) return;
    const user_id = localStorage.getItem('userID')!;
    const token = localStorage.getItem('token')!;
    const params = new URLSearchParams({
      user_id,
      token,
    });
    chatSocket.connect(params);
    console.log('Connecting to chat:', params.toString());
    return () => {
      console.log('Cleaning up chat socket');
      closeConnection('chat');
    };
  }, []);

  //fetching DM chat history
  useEffect(() => {
    if (selectedFriend !== null) {
      console.log('Selected friend:', selectedFriend);
      // fetch DM messages
      getDm(selectedFriend)
        .then((data) => {
          console.log('Chat history:', data);
          setMessages(data);

          // setMessages(...messages, data);
        })
        .catch((error) => {
          console.error('Failed to fetch chat history:', error);
        });
    }
  }, [selectedFriend]);

  useEffect(() => {
    console.log('messages:', messages);
  }, [messages]);

  //fetching room chat history
  useEffect(() => {
    if (roomId !== null) {
      console.log('Room ID:', roomId);
      // fetch chat messages
      getChat(roomId)
        .then((data) => {
          console.log('Chat history:', data);
          setMessages(data);

          // setMessages(...messages, data);
          console.log('messages:', messages);
        })
        .catch((error) => {
          console.error('Failed to fetch chat history:', error);
        });
    }
  }, [roomId]);

  useEffect(() => {
    console.log('my rooms useEffect: ', myRooms);
  }, [myRooms]);

  //get public chat rooms
  useEffect(() => {
    getPublicChat()
      .then((data) => {
        console.log('Public chat rooms:', data);
        setRooms(data);
      })
      .catch((error) => {
        console.error('Failed to fetch public chat rooms:', error);
      });
  }, []);

  //get my rooms
  useEffect(() => {
    const userId = localStorage.getItem('userID');
    if (!userId) return;
    getMyRooms()
      .then((data) => {
        console.log('My chat rooms:', data);
        setMyRooms(data);
      })
      .catch((error) => {
        console.error('Failed to fetch my chat rooms:', error);
      });
  }, []);

  useEffect(() => {
    if (connections.chat === 'connected') {
      console.log('Chat socket is already connected');
      chatSocket.addEventListener('message', handleChatMessage);
    }
    return () => {
      console.log('Cleaning up chat socket');
      chatSocket.removeEventListener('message', handleChatMessage);
    };
  }, [connections.chat]);

  const notifyMessage = (event: MessageEvent) => {
    if (
      (roomIdRef.current && event.room_id && event.room_id === roomIdRef.current) ||
      (selectedFriendRef.current &&
        event.receiver_id &&
        event.sender_id === selectedFriendRef.current)
    ) {
      return;
    }
    toast.custom((t) => (
      <MessageNotification>
        <div
          className="h-full w-full flex items-center glass-box"
          onClick={() => handleNotificationClick(event.sender_id)}
        >
          <div className="h-full aspect-square p-2">
            <img
              className="object-contain h-full w-full border-1"
              src={event.sender_avatar_url || './src/assets/images/default_avatar.png'}
            ></img>
          </div>
          <span className="text-xs">{event.message}</span>
        </div>
      </MessageNotification>
    ));
  };

  const handleNotificationClick = (sender_id: string) => {
    setSelectedFriend(sender_id);
    setRoomId(null);
    console.log('message notfication CLICKED: ', sender_id);
    openModal('chatModal', {
      user,
      friends,
      selectedFriendId: sender_id,
      sendChatMessage,
    });
  };

  const handleChatMessage = (event: MessageEvent) => {
    console.log('----- HANDLE MESSAGE -----');
    console.log('Chat message:', event);
    console.log('Chat room id:', event.room_id);
    console.log('chat receiver_id:', event.receiver_id);
    console.log('chat selected room id:', roomIdRef.current);
    console.log('chat selected friend id:', selectedFriendRef.current);

    notifyMessage(event);
    if (
      (roomIdRef.current && event.room_id && event.room_id === roomIdRef.current) ||
      (selectedFriendRef.current &&
        event.receiver_id &&
        event.sender_id === selectedFriendRef.current)
    ) {
      console.log('Adding message:', event);
      setMessages((prev) => [...prev, event]);
    }
  };

  const sendChatMessage = (selectedFriend, roomId, newMessage) => {
    const userId = localStorage.getItem('userID');
    if (!userId) return;

    if ((selectedFriend || roomId) && newMessage.trim() !== '') {
      console.log('creating message data: ', selectedFriend, roomId, newMessage);
      const messageData = {
        type: selectedFriend ? 'dm' : 'room',
        payload: {
          sender_id: userId,
          receiver_id: selectedFriend,
          room_id: roomId,
          message: newMessage,
        },
      };

      console.log('Sending message:', messageData);
      sendMessage('chat', messageData);
      setMessages((prev) => [...prev, { ...messageData.payload, sender_id: userId }]);
    }
  };

  const joinRoom = (id: string) => {
    const sender_id = user?.user_id;
    if (!sender_id) return;
    setRoomId(id);
    setSelectedFriend(null);
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
    }
    setRoomId(data.chat_room_id);
  };

  return (
    <ChatContext.Provider
      value={{
        user,
        friends,
        messages,
        selectedFriend,
        roomId,
        rooms,
        myRooms,
        members,
        setSelectedFriend,
        setRoomId,
        setMembers,
        sendChatMessage,
        joinRoom,
        createRoom,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChatContext = () => useContext(ChatContext);
