import React from 'react';

import { UserDataResponseType } from '@shared/types';

interface ProfilePictureProps {
  user: UserDataResponseType;
}

export const ProfilePictureMedium: React.FC<ProfilePictureProps> = ({ user }) => {
  return (
    <div className="relative border-1 h-[50px] w-[50px] overflow-hidden">
      <img
        className="object-cover w-full h-full"
        src={user.avatar_url}
        onError={(e) => {
          e.currentTarget.onerror = null;
          e.currentTarget.src = '/images/avatars/default_avatar.png';
        }}
        alt={`${user.display_name}'s profile picture`}
      />
    </div>
  );
};
