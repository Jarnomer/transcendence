import React from 'react';

import { UserDataResponseType } from '@shared/types/userTypes';

import { useChatContext } from '../../contexts/chatContext/ChatContext';
import { useModal } from '../../contexts/modalContext/ModalContext';
import { useUser } from '../../contexts/user/UserContext';
import { sendFriendRequest } from '../../services/friendService';
import { AddFriend } from '../UI/buttons/AddFriend';
import { NavIconButton } from '../UI/buttons/NavIconButton';
import { ProfilePicture } from './ProfilePicture';
import { getLastSeenTime } from './utils/lastSeen';

type Friend = {
  user_id: string;
  display_name: string;
  avatar_url: string;
};

interface ProfileHeaderProps {
  user: UserDataResponseType | null;
  isOwnProfile: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setEditProfile: React.Dispatch<React.SetStateAction<boolean>>;
  editProfile: boolean;
  sent: Friend;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  user,
  isOwnProfile,
  setLoading,
  setEditProfile,
  editProfile,
  sent,
}) => {
  const { setUser } = useUser();
  const { setSelectedFriend, setRoomId } = useChatContext();
  const { openModal } = useModal();
  const {
    messages,
    user: loggedInUser,
    friends,
    selectedFriendId,
    sendChatMessage,
  } = useChatContext();

  const handleAddFriendClick = (user_id: string) => {
    console.log('Sending friend request to user: ', user_id);
    sendFriendRequest(user_id);
  };

  const handleChatClick = (user_id: string) => {
    setSelectedFriend(user.user_id);
    setRoomId(null);
    console.log('Sending message to user: ', user_id);
    openModal('chatModal', {
      loggedInUser,
      friends,
      selectedFriendId: user?.user_id,
      sendChatMessage,
    });
  };

  const handleBlockUserClick = (user_id: string) => {
    console.log('Blocking user: ', user_id);
  };

  return (
    <div className="w-full border-1 text-left flex max-w-md md:max-w-full p-2 mb-5">
      <div className="flex w-full gap-4">
        {/* USER INFO */}
        <div className="w-full flex flex-col gap-2">
          <div className="bg-primary text-black min-w-full text-xs">
            <h2 className="w-full text-lg p-2 font-semibold">{user.display_name}</h2>
          </div>
          <div className="border-1 border-gray-400 p-5">
            <div className="flex flex-col text-xs">
              <p className="text-gray-400">@{user.username}</p>
              <span
                className={`text-xs ${user.status == 'online' ? 'text-green-500' : 'text-gray-500'}`}
              >
                {user.status === 'online' ? 'Online' : 'Offline'}
              </span>
              {user.status === 'offline' ? (
                <span className="text-xs text-gray-500">
                  {' '}
                  Last active: {getLastSeenTime(user.last_active)}
                </span>
              ) : null}
              <span></span>
            </div>

            {/* USER BIOGRAPHY */}
            <div>
              <span>{user?.bio}</span>
            </div>
          </div>
          {isOwnProfile ? (
            !editProfile ? (
              <button className="text-xs" onClick={() => setEditProfile(true)}>
                Edit Profile
              </button>
            ) : null
          ) : (
            <div className="flex gap-2">
              <AddFriend
                receiverUserId={user.user_id}
                sent={sent}
                onClick={() => handleAddFriendClick(user.user_id)}
              />
              <NavIconButton
                id="send-message"
                ariaLabel="send message"
                icon="chat"
                onClick={() => handleChatClick(user.user_id)}
              />
              <NavIconButton
                id="block-user"
                ariaLabel="block user"
                icon="block"
                onClick={() => handleBlockUserClick(user.user_id)}
              />
            </div>
          )}
        </div>
        <ProfilePicture user={user} isOwnProfile={isOwnProfile}></ProfilePicture>
      </div>
    </div>
  );
};
