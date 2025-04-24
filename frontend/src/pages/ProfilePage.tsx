import React, { useEffect, useState } from 'react';

import { useParams } from 'react-router-dom';

import { AnimatePresence, motion } from 'framer-motion';

import { FriendList } from '@components/profile/FriendList.tsx';
import { RadialBackground } from '@components/profile/RadialBackground.tsx';

import { getUserData } from '@services/userService';

import { UserDataResponseType } from '@shared/types/userTypes';

import { MatchHistory } from '../components/profile/MatchHistory';
import { ProfileHeader } from '../components/profile/ProfileHeader';
import { UserInformationForm } from '../components/signUp/UserInformationForm';
import { useUser } from '../contexts/user/UserContext';
import { getRequestsSent } from '../services/friendService';

export const animationVariants = {
  initial: {
    clipPath: 'inset(0 100% 0 0)',
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

export const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<UserDataResponseType | null>(null);
  const [sent, setSent] = useState<any>(null);
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
    console.log('User data updated:', user);
  }, [user]);

  useEffect(() => {
    setLoading(true);
    if (!userId) return;
    getRequestsSent()
      .then((data) => {
        setSent(data);
      })
      .catch((error) => {
        console.error('Failed to fetch user data: ', error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [userId]);

  useEffect(() => {
    if (!loggedInUser || !user?.avatar_url) return;
    if (user.user_id === loggedInUser?.user_id && !user.display_name) {
      setEditProfile(true);
    }
  }, [user]);

  if (loading) {
    return <div className="text-center mt-10 text-lg">Loading...</div>;
  }

  if (!user && !loading) {
    return <div className="text-center mt-10 text-lg text-red-500">Failed to load user data.</div>;
  }

  console.log('loggedInUser friend requests: ', loggedInUser?.friend_requests);
  return (
    <>
      <RadialBackground avatar_url={user?.avatar_url}></RadialBackground>
      <motion.div className="flex flex-col h-full w-full items-center">
        {loggedInUser?.friend_requests &&
        loggedInUser.friend_requests.some((req) => req.user_id === user?.user_id) ? (
          <span className="p-1">{user?.display_name + ' sent you a friend request'}</span>
        ) : (
          ''
        )}
        <AnimatePresence>
          {isOwnProfile && editProfile ? (
            <UserInformationForm
              user={user}
              setLoading={setLoading}
              setEditProfile={setEditProfile}
            ></UserInformationForm>
          ) : (
            <>
              <div className="gap-3 sm:flex sm:justify-center w-full">
                <div className="sm:w-1/2">
                  <ProfileHeader
                    user={user}
                    isOwnProfile={isOwnProfile}
                    setLoading={setLoading}
                    setEditProfile={setEditProfile}
                    editProfile={editProfile}
                    sent={sent}
                  ></ProfileHeader>
                </div>
                <motion.div className=" sm:w-1/2">
                  <FriendList
                    isOwnProfile={isOwnProfile}
                    friends={user.friends}
                    requests={user.friend_requests}
                    sents={sent}
                    loading={loading}
                    setLoading={setLoading}
                  />
                </motion.div>
              </div>
              <motion.div key="defaultSection" className="gap-3 sm:flex sm:justify-center w-full">
                <motion.div className="sm:w-1/2">
                  <MatchHistory user={user} />
                </motion.div>
                <motion.div className="sm:w-1/2">
                  <MatchHistory user={user} />
                </motion.div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
};
