import React, { useRef } from 'react';

import { useUser } from '../../contexts/user/UserContext';
import { api } from '../../services/api';
import { sendFriendRequest } from '../../services/friendService';
import { NavIconButton } from '../UI/buttons/NavIconButton';

interface ProfileHeaderProps {
  user: any[];
  isOwnProfile: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setEditProfile: React.Dispatch<React.SetStateAction<boolean>>;
  editProfile: boolean;
}

function timeAgo(lastActive: string): string {
  const now = new Date();
  const lastActiveDate = new Date(lastActive);
  const diffInMilliseconds = now.getTime() - lastActiveDate.getTime();

  const diffInSeconds = Math.floor(diffInMilliseconds / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  const diffInMonths = Math.floor(diffInDays / 30); // Approximate month calculation
  const diffInYears = Math.floor(diffInDays / 365); // Approximate year calculation

  if (diffInYears > 0) {
    return `${diffInYears} year${diffInYears > 1 ? 's' : ''} ago`;
  }
  if (diffInMonths > 0) {
    return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
  }
  if (diffInDays > 0) {
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  }
  if (diffInHours > 0) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  }
  if (diffInMinutes > 0) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  }
  return `${diffInSeconds} second${diffInSeconds > 1 ? 's' : ''} ago`;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  user,
  isOwnProfile,
  setLoading,
  setEditProfile,
  editProfile,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { setUser } = useUser();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const userID = localStorage.getItem('userID');
    if (!userID) {
      console.error('User ID not found');
      return;
    }
    const formData = new FormData();
    formData.append('avatar', file);

    setLoading(true);
    try {
      const res = await api.post(`user/avatar`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      if (res.status != 200) {
        throw new Error('Failed to upload avatar');
      }
      setUser(res.data);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

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
        <div className="rounded-full relative w-[150px] h-[150px] border-2 border-primary">
          {/* Profile Picture */}
          <img
            className="object-cover rounded-full w-full h-full z-10"
            src={`https://localhost:8443/${user.avatar_url}`}
          />

          {/* Upload Button */}
          {isOwnProfile && (
            <>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />

              <button
                className="absolute right-0 bottom-0 rounded-full"
                onClick={() => fileInputRef.current?.click()}
              >
                <svg
                  className="size-9"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="black"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                  />
                </svg>
              </button>
            </>
          )}
        </div>

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
            <span className="text-xs text-gray-500"> Last active: {timeAgo(user.last_active)}</span>
          ) : null}
          <span></span>
        </div>

        {isOwnProfile ? (
          !editProfile ? (
            <button onClick={() => setEditProfile(true)}>Edit Profile</button>
          ) : null
        ) : (
          <div className="flex gap-2">
            <NavIconButton
              id="add-friend"
              icon="addFriend"
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
