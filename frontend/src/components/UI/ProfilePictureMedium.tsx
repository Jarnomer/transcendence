import React from 'react';

import { UserDataResponseType } from '../../../../shared/types';

interface ProfilePictureProps {
  user: UserDataResponseType;
}

export const ProfilePictureMedium: React.FC<ProfilePictureProps> = ({ user }) => {
  const avatarUrl = user?.avatar_url ? user.avatar_url : './src/assets/images/default_avatar.png';
  return (
    <div className="relative border-1 h-[50px] w-[50px] overflow-hidden">
      <img
        className="object-cover w-full h-full"
        src={avatarUrl}
        alt={`${user.display_name}'s profile picture`}
      />
    </div>
  );
};
