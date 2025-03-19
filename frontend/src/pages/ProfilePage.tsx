import React, { useEffect, useState } from 'react';

import { useParams } from 'react-router-dom';

import { Vibrant } from 'node-vibrant/browser';

import { FriendList } from '@components/profile/FriendList.tsx';
import { MatchHistory } from '@components/profile/MatchHistory';
import { RadialBackground } from '@components/profile/RadialBackground.tsx';

import { getUserData } from '@services/userService';

import { EditProfile } from '../components/profile/EditProfile';
import { ProfileHeader } from '../components/profile/ProfileHeader';
import { useUser } from '../contexts/user/UserContext';

export const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [editProfile, setEditProfile] = useState<boolean>(false);

  const { userId } = useParams<{ userId: string }>();
  const { user: loggedInUser } = useUser();
  const isOwnProfile = userId === loggedInUser?.user_id;

  useEffect(() => {
    setLoading(true);
    if (!userId) return;

    if (loggedInUser && userId === loggedInUser.user_id) {
      setUser(loggedInUser);
      setLoading(false);
    } else {
      getUserData(userId)
        .then((data) => {
          console.log('User dataaaa: ', user);
          setUser(data);
        })
        .catch((error) => {
          console.error('Failed to fetch user data: ', error);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [userId, loggedInUser]);

  useEffect(() => {
    if (!loggedInUser || !user?.avatar_url) return;
    console.log(user);
    if (user.user_id === loggedInUser?.user_id && !user.display_name) {
      console.log('edit user set to true');
      setEditProfile(true);
    }
  }, [user]);

  if (loading) {
    return <div className="text-center mt-10 text-lg">Loading...</div>;
  }

  if (!user && !loading) {
    return <div className="text-center mt-10 text-lg text-red-500">Failed to load user data.</div>;
  }

  return (
    <>
      <RadialBackground avatar_url={user.avatar_url}></RadialBackground>

      <div className="w-full h-full flex flex-col items-center p-6 text-center">
        <ProfileHeader
          user={user}
          isOwnProfile={isOwnProfile}
          setLoading={setLoading}
          setEditProfile={setEditProfile}
          editProfile={editProfile}
        ></ProfileHeader>
        {isOwnProfile && editProfile ? (
          <EditProfile
            setLoading={setLoading}
            user={user}
            setEditProfile={setEditProfile}
          ></EditProfile>
        ) : (
          <div className="w-full flex gap-4 flex-col md:flex-row items-top justify-center text-center">
            <FriendList
              isOwnProfile={isOwnProfile}
              friends={user.friends}
              requests={user.friend_requests}
            ></FriendList>
            <MatchHistory user={user}></MatchHistory>
          </div>
        )}
      </div>
    </>
  );
};
