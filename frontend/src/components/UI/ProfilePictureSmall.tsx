import React from 'react';

import { UserDataResponseType } from '@shared/types';

interface ProfilePictureProps {
  user: UserDataResponseType;
  avataUrl: string | null;
}

export const ProfilePictureSmall: React.FC<ProfilePictureProps> = ({ user }) => {
  return (
    <div className="w-[20px] h-[20px] rounded-full overflow-hidden">
      <img
        className="object-contain w-full h-full"
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
