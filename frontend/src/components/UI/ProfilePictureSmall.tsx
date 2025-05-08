import React from 'react';

import { BlockedUserType, FriendType } from '@shared/types';

interface ProfilePictureProps {
  user?: BlockedUserType;
  friend?: FriendType;
  avatarUrl: string;
}

export const ProfilePictureSmall: React.FC<ProfilePictureProps> = ({ user, friend, avatarUrl }) => {
  const displayName = user?.display_name || friend?.display_name || 'User';
  const imageUrl = avatarUrl || user?.avatar_url || friend?.avatar_url;

  return (
    <div className="w-[20px] h-[20px] rounded-full overflow-hidden">
      <img
        className="object-contain w-full h-full"
        src={imageUrl}
        onError={(e) => {
          e.currentTarget.onerror = null;
          e.currentTarget.src = '/images/avatars/default_avatar.png';
        }}
        alt={`${displayName}'s profile picture`}
      />
    </div>
  );
};
