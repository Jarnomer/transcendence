import React from 'react';

import { UserDataResponseType } from '@shared/types/userTypes';

import { useChatContext } from '../../contexts/chatContext/ChatContext';
import { useModal } from '../../contexts/modalContext/ModalContext';
import { useUser } from '../../contexts/user/UserContext';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { acceptFriendRequest, sendFriendRequest } from '../../services/friendService';
import { UserActions } from '../UI/buttons/UserActions';
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
  const { user: loggedInUser, setUser, refetchUser } = useUser();
  const { setOpenChatWindows, messages, fetchDmHistory, friends } = useChatContext();
  const isDesktop = useMediaQuery('(min-width: 600px)');
  const { openModal, closeModal } = useModal();

  const handleAddFriendClick = (user_id: string) => {
    if (
      loggedInUser?.friend_requests &&
      loggedInUser.friend_requests.some((req) => req.user_id === user?.user_id)
    ) {
      console.log('ACCEPTING FRIEND REQUEST');
      acceptFriendRequest(user_id)
        .then(() => {
          console.log('Friend request accepted');
          refetchUser();
        })
        .catch((error) => {
          console.error('Failed to accept friend request: ', error);
        });
    } else {
      console.log('Sending friend request to user: ', user_id);
      sendFriendRequest(user_id);
    }
  };

  const handleChatClick = async (friendId: string) => {
    console.log('opening chat', friendId);
    if (!isDesktop) {
      openModal('chatModal', {
        loggedInUser,
        friends,
        selectedFriendId: user?.user_id,
        onClose: closeModal,
      });
    } else {
      setOpenChatWindows((prev) => ({
        ...prev,
        [friendId]: true,
      }));

      if (!messages[friendId]) {
        await fetchDmHistory(friendId);
      }
    }
  };

  const handleBlockUserClick = (user_id: string) => {
    console.log('Blocking user: ', user_id);
  };

  return (
    <div className="w-full border-1 text-left flex  max-w-md md:max-w-full p-2">
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
                className={`text-xs ${user.status == 'online' ? 'text-secondary' : 'text-gray-500'}`}
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
              <button className="text-xs hover:text-secondary" onClick={() => setEditProfile(true)}>
                Edit Profile
              </button>
            ) : null
          ) : (
            <UserActions user={user}></UserActions>
          )}
        </div>
        <ProfilePicture
          user={user}
          isOwnProfile={isOwnProfile}
          setLoading={setLoading}
        ></ProfilePicture>
      </div>
    </div>
  );
};
