import React, { useState } from 'react';

import { useChatContext } from '@contexts';

import { FriendType } from '@shared/types';

import { ClippedButton } from '../UI/buttons/ClippedButton';
import { NavIconButton } from '../UI/buttons/NavIconButton';
import SearchBar from '../UI/SearchBar';

type CreateRoomPopupProps = {
  handleClickNewChat: () => void;
};

export const CreateNewGroupChat: React.FC<CreateRoomPopupProps> = ({ handleClickNewChat }) => {
  const [roomName, setRoomName] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const { friends, createRoom } = useChatContext();

  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value.toLowerCase());
  };

  const filteredUsers = friends.filter((friend: FriendType) =>
    friend.display_name?.toLowerCase().startsWith(searchQuery)
  );

  const handleRoomCreation = () => {
    if (roomName.trim() === '') return;

    createRoom(roomName, isPrivate, selectedMembers);
    handleClickNewChat();
  };

  const handleToggleMember = (friendId: string) => {
    setSelectedMembers((prevSelected) =>
      prevSelected.includes(friendId)
        ? prevSelected.filter((id) => id !== friendId)
        : [...prevSelected, friendId]
    );
  };

  return (
    <div id="chatSideBar" className={`w-full h-full  border-r p-2 overflow-y-auto`}>
      <div className="w-full flex gap-3 relative">
        <div className="overflow-hidden absolute left-0">
          <NavIconButton
            id="go-back-button"
            ariaLabel="back to chat list"
            icon="arrowLeft"
            onClick={() => handleClickNewChat()}
          />
        </div>
        <div className="mb-2 text-center w-full">
          <p>New Group Chat</p>
        </div>
      </div>

      <div>
        <>
          <div className="flex w-full">
            <div className={`w-full flex flex-col items-center gap-2 mb-2`}>
              <input
                type="text"
                placeholder="Room name"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                className="w-full p-2 text-sm mt-2 border"
              />

              <SearchBar
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search users"
              />

              <div className="mt-4 w-full">
                {friends && friends.length > 0 ? <h3>Suggested:</h3> : null}
                {filteredUsers.map((friend: FriendType) => (
                  <div key={`create_room_${friend.user_id}`} className="flex gap-3 mt-2 ml-2">
                    <div className="w-[30px] h-[30px] rounded-full overflow-hidden">
                      <img
                        src={friend.avatar_url}
                        aria-label={`${friend.display_name}'s profile picture`}
                        className="object-contain"
                      />
                    </div>
                    <span className="text-sm">{friend.display_name}</span>
                    <input
                      type="checkbox"
                      checked={selectedMembers.includes(friend.user_id)}
                      onChange={() => handleToggleMember(friend.user_id)}
                      className="w-4 h-4 border-2 border-current bg-transparent appearance-none cursor-pointer checked:bg-transparent checked:border-current checked:text-current checked:after:content-['✔'] checked:after:text-current checked:after:block checked:after:text-center"
                    />
                  </div>
                ))}
              </div>
              <div className="w-full flex gap-5  items-center justify-center">
                <div className=" flex flex-col mt-4">
                  <label htmlFor="private-toggle" className="mr-2 text-sm">
                    Private Room:
                  </label>
                  <div className="flex items-center">
                    <input
                      id="private-toggle"
                      type="checkbox"
                      checked={isPrivate}
                      onChange={(e) => setIsPrivate(e.target.checked)}
                      className="w-4 h-4 border-2 border-current bg-transparent appearance-none cursor-pointer checked:bg-transparent checked:border-current checked:text-current checked:after:content-['✔'] checked:after:text-current checked:after:block checked:after:text-center"
                    />
                    <label htmlFor="enableEffect" className="ml-2 cursor-pointer">
                      <span className={`text-sm ${isPrivate ? 'text-secondary' : 'text-gray-400'}`}>
                        {!isPrivate ? 'public' : 'private'}
                      </span>
                    </label>
                  </div>
                </div>
                <ClippedButton label={'Create'} onClick={handleRoomCreation} />
                <div className="absolute bottom-0 right-0 p-4"></div>
              </div>
            </div>
          </div>
        </>
      </div>
    </div>
  );
};
