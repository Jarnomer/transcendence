import React, { useRef, useState } from 'react';

import { UserDataResponseType } from '../../../../shared/types';
import { useUser } from '../../contexts/user/UserContext';
import { api } from '../../services/api';

interface ProfilePictureProps {
  user: UserDataResponseType;
  isOwnProfile: boolean;
}

interface uploadAvatarButtonProps {
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

export const UploadAvatarButton: React.FC<uploadAvatarButtonProps> = ({ setLoading }) => {
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

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        aria-label="Upload profile picture"
        accept="image/*"
        onChange={handleFileChange}
      />

      <button
        aria-label="upload profile picture"
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
  );
};

export const ProfilePicture: React.FC<ProfilePictureProps> = ({ user, isOwnProfile }) => {
  const { setUser } = useUser();
  const [loading, setLoading] = useState<boolean>(false);

  return (
    <div>
      <div className=" overflow-hidden relative w-[100px] h-[100px] md:w-[150px] md:h-[150px] border-1 border-primary">
        <img
          className="object-cover w-full h-full z-10"
          src={`https://localhost:8443/${user.avatar_url}`}
          alt="user profile picture"
        />

        {/* Upload Button */}
        {isOwnProfile && <UploadAvatarButton setLoading={setLoading}></UploadAvatarButton>}
      </div>
    </div>
  );
};
