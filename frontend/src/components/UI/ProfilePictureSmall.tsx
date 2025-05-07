import React from 'react';

import { UserDataResponseType } from '@shared/types';

interface ProfilePictureProps {
  user: UserDataResponseType;
  avataUrl: string | null;
}

export const ProfilePictureSmall: React.FC<ProfilePictureProps> = ({ user }) => {
  return (
    <div className="w-[20px] h-[20px] rounded-full overflow-hidden">
      <img src={user.avatar_url} alt="" className="object-contain w-full h-full" />
    </div>
  );
};
