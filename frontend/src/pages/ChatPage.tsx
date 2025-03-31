import React, { useEffect, useState } from 'react';

import { BackgroundGlow } from '../components';
import SearchBar from '../components/UI/SearchBar';
import { useWebSocketContext } from '../contexts/WebSocketContext';
import {
  addMember,
  createChatRoom,
  getChat,
  getDm,
  getMyRooms,
  getPublicChat,
} from '../services/chatService';
import { getUserData } from '../services/userService';

export const ChatPage: React.FC = () => {
  const { chatSocket, sendMessage, closeConnection, connections } = useWebSocketContext();
  const [user, setUser] = useState<any>(null);
  const [friends, setFriends] = useState<any[]>([]);
  const [selectedFriend, setSelectedFriend] = useState<string | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState<boolean>(false);
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [myRooms, setMyRooms] = useState<any[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const [members, setMembers] = useState<any[]>([]);

  const [roomName, setRoomName] = useState('');

  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value.toLowerCase());
    console.log('asd');
  };

  const filteredUsers = friends.filter((user) =>
    user.display_name.toLowerCase().startsWith(searchQuery)
  );

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
  //fetching user data

  useEffect(() => {
    const userId = localStorage.getItem('userID');
    if (!userId) return;
    setLoading(true);
    getUserData(userId)
      .then((data) => {
        console.log('User dataaaa: ', data);
        setUser(data);
        setFriends(data.friends);
      })
      .catch((error) => {
        console.error('Failed to fetch user data: ', error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  //fetching DM chat history
  useEffect(() => {
    if (selectedFriend !== null) {
      console.log('Selected friend:', selectedFriend);
      // fetch DM messages
      getDm(selectedFriend)
        .then((data) => {
          console.log('Chat history:', data);
          setMessages(...messages, data);
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
          setMessages(...messages, data);
          console.log('messages:', messages);
        })
        .catch((error) => {
          console.error('Failed to fetch chat history:', error);
        });
    }
  }, [roomId]);

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

  const handleChatMessage = (event: MessageEvent) => {
    console.log('Chat message:', event);
    setMessages((prev) => [...prev, event]);
  };

  const handleSendMessage = () => {
    const userId = localStorage.getItem('userID');
    if (!userId) return;
    if ((selectedFriend || roomId) && newMessage.trim() !== '') {
      const messageData = {
        type: selectedFriend ? 'dm' : 'room',
        payload: {
          sender_id: userId,
          receiver_id: selectedFriend,
          room_id: roomId,
          message: newMessage,
        },
      };
      setMessages((prev) => [...prev, messageData.payload]);
      sendMessage('chat', messageData);
      console.log('Sending message:', messages);
      setNewMessage('');
    }
  };

  const createRoom = async (event) => {
    try {
      event.preventDefault();
      console.log('Creating room:', roomName, isPrivate, members);
      const data = await createChatRoom(roomName, isPrivate ? 'private' : 'public');
      console.log('Chat room created:', data);
      if (data) {
        const res = await addMember(data.chat_room_id, members);
        console.log('Members added:', res);
      }
    } catch (error) {
      console.error('Failed to create chat room:', error);
    }
  };

  const handleRoomJoin = (roomId: string) => {
    setRoomId(roomId);
    setMessages([]);
    sendMessage('chat', {
      type: 'join',
      payload: {
        room_id: roomId,
        sender_id: user.user_id,
      },
    });
    console.log('Joining room:', roomId);
  };

  const togglePopup = () => {
    setIsVisible(!isVisible);
  };

  const addToRoomMember = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    if (checked) {
      console.log('Adding member:', value);
      setMembers((prev) => [...prev, value]);
    } else {
      setMembers((prev) => prev.filter((member) => member !== value));
    }
  };

  useEffect(() => {
    console.log('Members:', members);
  }, [members]);

  return (
    <div className="p-10 w-[80%]">
      {/* <AnimatePresence> */}
      {/* just testing here */}
      {/* <BracketLine></BracketLine> */}
      {/* </AnimatePresence> */}
      <button onClick={togglePopup} className="text-xl font-bold mb-4 ">
        Create Room
      </button>
      {isVisible && (
        <form onSubmit={createRoom} className="mb-4">
          <label className="flex items-center mt-2">
            <input
              type="checkbox"
              className="mr-2"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
            />
            Private Room
          </label>
          <input
            type="text"
            placeholder="Room name"
            className="flex border p-2 items-center"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            required
          />
          {isPrivate &&
            friends.map((friend) => (
              <div key={friend.user_id} className="flex items-center mt-2">
                <input
                  type="checkbox"
                  className="mr-2"
                  value={friend.user_id}
                  onChange={addToRoomMember}
                />
                {friend.display_name}
              </div>
            ))}
          <button type="submit" className="bg-primary/25 px-4 py-2 rounded mt-2 items-center">
            Create
          </button>
        </form>
      )}
      <div className="flex relative h-[600px] glass-box overflow-hidden">
        <BackgroundGlow />
        {/* Friends List */}
        <div className="w-1/4 p-4 border-r ">
          <SearchBar
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search users..."
          />
          <h2 className="text-xl font-bold mb-4">Friends</h2>
          <ul>
            {filteredUsers.map((friend) => (
              <li
                key={friend.user_id}
                className={`p-2 rounded cursor-pointer ${selectedFriend === friend.user_id ? 'bg-gray-700' : 'hover:bg-gray-800'} ${friend.status === 'online' ? 'text-primary' : 'text-gray-500'}`}
                onClick={() => setSelectedFriend(friend.user_id)}
              >
                {friend.display_name} {friend.status === 'online' ? '' : '(Offline)'}
              </li>
            ))}
          </ul>
          <h2 className="text-xl font-bold mt-4 mb-2">Chat Rooms</h2>
          <ul>
            {rooms.map((room) => (
              <li
                key={room.chat_room_id}
                className={`p-2 rounded cursor-pointer ${roomId === room.chat_room_id ? 'bg-gray-700' : 'hover:bg-gray-800'}`}
                onClick={() => handleRoomJoin(room.chat_room_id)}
              >
                {room.name}
              </li>
            ))}
          </ul>
          <h2 className="text-xl font-bold mt-4 mb-2">My Rooms</h2>
          <ul>
            {myRooms.map((room) => (
              <li
                key={room.chat_room_id}
                className={`p-2 rounded cursor-pointer ${roomId === room.chat_room_id ? 'bg-gray-700' : 'hover:bg-gray-800'}`}
                onClick={() => handleRoomJoin(room.chat_room_id)}
              >
                {room.name}
              </li>
            ))}
          </ul>
        </div>

        {/* Chat Window */}
        <div className="w-full flex flex-col h-full ">
          {selectedFriend !== null || roomId !== null ? (
            <>
              <div className="p-4  font-bold">
                {' '}
                {friends.find((f) => f.user_id === selectedFriend)?.username}
              </div>
              <div className="flex-1 p-4 overflow-y-auto">
                {/* Chat Messages */}
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`mb-2 p-2 rounded ${msg.sender_id === user.user_id ? 'border-primary border-1 w-max' : 'border-primary border-1 ml-auto w-max'}`}
                  >
                    {msg.message}
                  </div>
                ))}
              </div>
              {/* Message Input */}
              <div className="p-4 border-t border-primary flex">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 p-2 bg-gray-800 border-2 border-primary bg-black/5 rounded focus:outline-none"
                />
                <button
                  onClick={handleSendMessage}
                  className="ml-2 bg-primary/25 px-4 py-2 rounded"
                >
                  Send
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              Select a friend to chat
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
