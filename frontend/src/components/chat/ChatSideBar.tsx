import React, { useState } from 'react';

import { Room, User } from '@/shared/types';

import { useChatContext } from '../../contexts/chatContext/ChatContext';

interface ChatSidebarProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  filteredUsers: User[];
  rooms: Room[];
  myRooms: Room[];
  selectedFriend: string | null;
  roomId: string | null;
  onFriendSelect: (id: string) => void;
  onRoomSelect: (id: string) => void;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const {
    friends,
    selectedFriend,
    roomId,
    rooms,
    myRooms,
    setSelectedFriend,
    setRoomId,
    joinRoom,
  } = useChatContext();

  const filteredUsers = friends.filter((u) =>
    u.display_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <div
        id="chatSideBar"
        className={`w-full h-full ${selectedFriend ? 'hidden lg:block' : 'md:block'} border-r p-2 overflow-y-auto`}
      >
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search friends..."
          className="w-full p-1 rounded border mb-2"
        />

        <div>
          <h3 className="text-sm font-bold mb-1">Friends</h3>
          {filteredUsers.map((user) => (
            <div className="flex gap-3 justify-center items-center" key={`chat_${user.user_id}`}>
              <div className="w-[25px] h-[25px]">
                <img
                  src={user?.avatar_url}
                  alt="avatar"
                  className="w-full max-w-full h-full object-cover rounded-full"
                />
              </div>
              <button
                onClick={() => {
                  setSelectedFriend(user.user_id);
                  setRoomId(null);
                }}
                className={`block w-full text-left p-1 rounded ${
                  selectedFriend === user.user_id ? 'bg-primary/25' : ''
                }`}
              >
                {user.display_name}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-4">
          <h3 className="text-sm font-bold mb-1">Rooms</h3>
          {[...myRooms, ...rooms].map((room) => (
            <button
              key={room.chat_room_id}
              onClick={() => {
                joinRoom(room.chat_room_id);
                setSelectedFriend(null);
                setRoomId(room.chat_room_id);
              }}
              className={`block w-full text-left p-1 rounded hover:bg-gray-100 ${
                roomId === room.chat_room_id ? 'bg-gray-200' : ''
              }`}
            >
              {room.name}
            </button>
          ))}
        </div>
      </div>
    </>
  );
};
