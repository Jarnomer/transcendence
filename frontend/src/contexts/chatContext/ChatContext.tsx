import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

import { toast } from 'react-hot-toast';
import { useLocation } from 'react-router-dom';

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
  const location = useLocation();
  const isChatPage = location.pathname === '/chat' ? true : false;

  const { user } = useUser();
  const [friends, setFriends] = useState<any[]>([]);
  const [selectedFriend, setSelectedFriend] = useState<string | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Record<string, any[]>>({});
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

  // useEffect(() => {
  //   console.log('chat context:', connections);
  //   const userId = localStorage.getItem('userID');
  //   if (!userId) return;
  //   const user_id = localStorage.getItem('userID')!;
  //   const token = localStorage.getItem('token')!;
  //   const params = new URLSearchParams({
  //     user_id,
  //     token,
  //   });
  //   chatSocket.connect(params);
  //   console.log('Connecting to chat:', params.toString());
  //   return () => {
  //     console.log('Cleaning up chat socket');
  //     closeConnection('chat');
  //   };
  // }, []);

  const fetchDmHistory = async (friendId: string) => {
    try {
      console.log('Fetching DM history for friend:', friendId);
      const data = (await getDm(friendId)) as any;
      console.log('DM history:', data);
      setMessages((prev) => ({
        ...prev,
        [friendId]: data,
      }));
    } catch (error) {
      console.error('Failed to fetch DM history:', error);
    }
  };

  //fetching DM chat history
  useEffect(() => {
    if (!selectedFriend) return;
    console.log('Selected friend:', selectedFriend);
    if (messages[selectedFriend]?.length > 0) {
      console.log('Already have messages for this friend:', selectedFriend);
      setMessages((prev) => ({
        ...prev,
        [selectedFriend]: prev[selectedFriend],
      }));
      return;
    } else {
      // fetch DM messages
      fetchDmHistory(selectedFriend);
    }
  }, [selectedFriend]);

  // useEffect(() => {
  //   console.log('messages:', messages);
  // }, [messages]);

  const fetchChatHistory = async (roomId: string) => {
    try {
      console.log('Fetching chat history for room:', roomId);
      const data = (await getChat(roomId)) as any;
      console.log('Chat history:', data);
      setMessages((prev) => ({
        ...prev,
        [roomId]: data,
      }));
    } catch (error) {
      console.error('Failed to fetch chat history:', error);
    }
  };

  //fetching room chat history
  useEffect(() => {
    if (roomId !== null) {
      console.log('Room ID:', roomId);
      if (messages[roomId]?.length > 0) {
        console.log('Already have messages for this room:', roomId);
        setMessages((prev) => ({
          ...prev,
          [roomId]: prev[roomId],
        }));
      } else {
        // fetch chat messages
        fetchChatHistory(roomId);
      }
    }
  }, [roomId]);

  //get public chat rooms
  useEffect(() => {
    if (!user) return;
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
    // console.log('Chat socket is already connected');
    chatSocket.addEventListener('message', handleChatMessage);
    return () => {
      console.log('Cleaning up chat socket');
      chatSocket.removeEventListener('message', handleChatMessage);
    };
  }, []);

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
              src={event.avatar_url || './src/assets/images/default_avatar.png'}
            ></img>
          </div>
          <div className="text-xs">
            <p className="text-xs">{event.display_name}</p>
            <p className="text-xs">{event.message}</p>
          </div>
        </div>
      </MessageNotification>
    ));
  };

  const handleNotificationClick = (sender_id: string) => {
    // setSelectedFriend(sender_id);
    // setRoomId(null);
    console.log('message notfication CLICKED: ', sender_id);
    console.log('ischatpage', isChatPage);
    // if (isChatPage) return;
    openModal('chatModal', {
      user,
      friends,
      selectedFriendId: sender_id,
      onsend: sendChatMessage,
      messages,
    });
  };

  const handleChatMessage = (event: MessageEvent) => {
    console.log('----- HANDLE MESSAGE -----');
    console.log('Chat message:', event);
    console.log('Chat room id:', event.room_id);
    console.log('chat receiver_id:', event.receiver_id);
    console.log('chat selected room id:', roomIdRef.current);
    console.log('chat selected friend id:', selectedFriendRef.current);

    if (event.room_id) {
      console.log('Adding room message:', event);
      setMessages((prev) => ({
        ...prev,
        [event.room_id]: [...(prev[event.room_id] || []), event],
      }));
    }

    if (event.sender_id) {
      console.log('Adding dm message:', event);
      setMessages((prev) => ({
        ...prev,
        [event.sender_id]: [...(prev[event.sender_id] || []), event],
      }));
    }
    notifyMessage(event);
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
          avatar_url: user?.avatar_url,
          display_name: user?.display_name,
          receiver_id: selectedFriend,
          room_id: roomId,
          message: newMessage,
        },
      };

      console.log('Sending message:', messageData);
      sendMessage('chat', messageData);
      setMessages((prev) => ({
        ...prev,
        [selectedFriend || roomId]: [
          ...(prev[selectedFriend || roomId] || []),
          messageData.payload,
        ],
      }));
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
    console.log('roomName: ', roomName, ' isPrivate: ', isPrivate, 'memberList: ', memberList);
    const data = await createChatRoom(roomName, isPrivate ? 'private' : 'public');
    if (data) {
      console.log('create room data: ', data);
      await addMember(data.chat_room_id, memberList);
      setRooms((prev) => [...prev, data]);
    }
    setRoomId(data.chat_room_id);
    return roomId;
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
