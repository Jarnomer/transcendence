import React, { useState } from 'react';

import { FriendType } from '../../../../shared/types';
import { useChatContext } from '../../contexts/chatContext/ChatContext';
import { useSound } from '../../hooks/useSound';
import { NavIconButton } from '../UI/buttons/NavIconButton';
import SearchBar from '../UI/SearchBar';

interface ChatSidebarProps {
  handleClickNewChat: () => void;
  onOpenChat: (friendId: string) => void;
  onOpenRoom: (friendId: string) => void;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  handleClickNewChat,
  onOpenChat,
  onOpenRoom,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { friends, rooms, myRooms, roomId, joinRoom } = useChatContext();
  const playSelectSound = useSound('/sounds/effects/select.wav');

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value.toLowerCase());
  };

  console.log('FRIENDS: ', friends);

  const filteredUsers = friends.filter((friend: FriendType) =>
    friend.display_name?.toLowerCase().startsWith(searchQuery)
  );
  return (
    <>
      <div id="chatSideBar" className={`w-full h-full  border-r p-2 overflow-y-auto`}>
        <div className={`flex  items-center gap-2 mb-2`}>
          <SearchBar value={searchQuery} onChange={handleSearchChange} placeholder="Search" />
          <div className="w-8 h-8">
            <NavIconButton
              id="new-chat-button"
              ariaLabel="New Chat"
              icon="PencilSquareIcon"
              onClick={handleClickNewChat}
            />
          </div>
        </div>

        <div>
          <h3 className="text-md font-bold mb-1">Friends</h3>
          {filteredUsers.map((user: FriendType) => (
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
                  playSelectSound();
                  onOpenChat(user.user_id);
                }}
                className={`block w-full text-left text-sm p-1 rounded `}
              >
                {user.display_name}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-4">
          <h3 className="text-md font-bold mb-1">Rooms</h3>
          {[...myRooms, ...rooms].map((room) => (
            <button
              key={room.chat_room_id}
              onClick={() => {
                playSelectSound();
                joinRoom(room.chat_room_id);
                onOpenRoom(room.chat_room_id);
                // setSelectedFriend(null);
                // setRoomId(room.chat_room_id);
              }}
              className={`block w-full text-sm text-left p-1 rounded hover:bg-secondary/20 ${
                roomId === room.chat_room_id ? 'text-secondary' : ''
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
