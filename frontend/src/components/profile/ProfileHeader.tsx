import React from 'react';

import { UserDataResponseType } from '@shared/types/userTypes';

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
  user: UserDataResponseType;
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

  const handleAddFriendClick = (user_id: string) => {
    console.log('Sending friend request to user: ', user_id);
    sendFriendRequest(user_id);
  };

  const handleChatClick = (user_id: string) => {
    console.log('Sending message to user: ', user_id);
  };

  const handleBlockUserClick = (user_id: string) => {
    console.log('Blocking user: ', user_id);
  };

  return (
    <div className="w-full max-w-md p-6">
      <div className="flex flex-col items-center gap-4">
        <ProfilePicture user={user} isOwnProfile={isOwnProfile}></ProfilePicture>

        {/* USER INFO */}
        <span>
          <h2 className="text-xl font-semibold">{user.display_name}</h2>
          <p className="text-gray-400">@{user.username}</p>
        </span>
        <div className="flex flex-col">
          <span
            className={`text-sm font-medium ${user.status == 'online' ? 'text-green-500' : 'text-gray-500'}`}
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

        {isOwnProfile ? (
          !editProfile ? (
            <button onClick={() => setEditProfile(true)}>Edit Profile</button>
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
              icon="chat"
              onClick={() => handleChatClick(user.user_id)}
            />
            <NavIconButton
              id="block-user"
              icon="block"
              onClick={() => handleBlockUserClick(user.user_id)}
            />
          </div>
        )}
      </div>
    </div>
  );
};
