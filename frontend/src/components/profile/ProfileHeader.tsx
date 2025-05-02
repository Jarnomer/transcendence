import React from 'react';

import { motion } from 'framer-motion';

import { UserDataResponseType } from '@shared/types/userTypes';

import { useUser } from '../../contexts/user/UserContext';
import { UserActions } from '../UI/buttons/UserActions';
import { ProfilePicture } from './ProfilePicture';
import { getLastSeenTime } from './utils/lastSeen';

export const animationVariants = {
  initial: {
    clipPath: 'inset(100% 0 0  0 )',
    opacity: 0,
  },
  animate: {
    clipPath: 'inset(0 0% 0 0)',
    opacity: 1,
    transition: { duration: 0.4, ease: 'easeInOut', delay: 0.3 },
  },
  exit: {
    clipPath: 'inset(0 100% 0 0)',
    opacity: 0,
    transition: { duration: 0.4, ease: 'easeInOut' },
  },
};

type Friend = {
  user_id: string;
  display_name: string;
  avatar_url: string;
};

interface ProfileHeaderProps {
  user: UserDataResponseType | null;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setEditProfile: React.Dispatch<React.SetStateAction<boolean>>;
  editProfile: boolean;
  sent: Friend;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  user,
  setLoading,
  setEditProfile,
  editProfile,
  sent,
}) => {
  const { user: loggedInUser } = useUser();

  const isOwnProfile = user?.user_id === loggedInUser?.user_id;
  user = isOwnProfile ? loggedInUser : user;

  if (!user) return;

  return (
    <motion.div
      className="w-full border-1 text-left flex p-2 backdrop-blur-sm"
      variants={animationVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div className="flex w-full gap-4">
        <ProfilePicture
          user={user}
          isOwnProfile={isOwnProfile}
          setLoading={setLoading}
        ></ProfilePicture>
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
              <span className="text-xs text-gray-500">{user?.bio}</span>
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
      </div>
    </motion.div>
  );
};
