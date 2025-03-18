import React from 'react';

import { useParams } from 'react-router-dom';

import { useUser } from '../../contexts/user/UserContext';

type user = {
  user_id: string;
  display_name: string;
  avatar_url: string;
  games: any[];
};

interface ProfilePictureProps {
  user: user[];
  editProfile: boolean;
  setEditProfile: () => void;
}

export const ProfilePicture: React.FC<ProfilePictureProps> = (
  user,
  editProfile,
  setEditProfile
) => {
  const { userId } = useParams<{ userId: string }>();
  const { user: loggedInUser } = useUser();
  const isOwnProfile = userId === loggedInUser?.user_id;

  useEffect(() => {}, [user]);
  return (
    <>
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
    </>
  );
};
