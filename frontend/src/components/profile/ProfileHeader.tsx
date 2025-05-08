import React from 'react';

import { motion } from 'framer-motion';

import { useModal, useUser } from '@contexts';

import { ProfilePicture } from '@components/profile';
import { UserActions } from '@components/UI';

import { UserDataResponseType } from '@shared/types';

const animationVariants = {
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

interface ProfileHeaderProps {
  user: UserDataResponseType | null;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ user }) => {
  const { user: loggedInUser } = useUser();
  const { openModal } = useModal();

  if (!user) return;

  const isOwnProfile = user?.user_id === loggedInUser?.user_id;
  user = isOwnProfile ? loggedInUser : user;

  return (
    <motion.div
      className="w-full border-1 text-left flex gap-2 p-2 backdrop-blur-sm glass-box"
      variants={animationVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <motion.div
        layout
        transition={{ duration: 0.5, ease: 'easeInOut' }}
        className="aspect-square
      max-w-[80px] max-h-[80px] w-[80px] h-[80px]
      sm:max-w-[150px] sm:max-h-[150px] sm:w-[150px] sm:h-[150px]
      lg:max-w-[200px] lg:max-h-[200px] lg:w-[200px] lg:h-[200px]"
      >
        <ProfilePicture user={user} isOwnProfile={isOwnProfile}></ProfilePicture>
      </motion.div>
      {/* USER INFO */}
      <div className="w-full flex flex-col gap-2">
        {/* USER DISPLAY NAME */}
        <div className="bg-primary text-black w-full text-xs">
          <h2 className="w-full text-lg p-2 font-semibold">{user.display_name}</h2>
        </div>

        <div className="border-1 flex flex-col text-xs border-gray-400 p-1 sm:p-5">
          <p className="text-gray-400">@{user.username}</p>
          <p className={`text-xs ${user.status == 'online' ? 'text-secondary' : 'text-primary'}`}>
            {user.status === 'online' ? 'Online' : 'Offline'}
          </p>

          {/* USER BIOGRAPHY */}
          <span className="text-xs text-gray-500">{user?.bio}</span>
        </div>

        {isOwnProfile ? (
          <button
            className="text-xs hover:text-secondary"
            onClick={() => {
              openModal('editProfile');
            }}
          >
            Edit Profile
          </button>
        ) : (
          <UserActions user={user}></UserActions>
        )}
      </div>
    </motion.div>
  );
};
