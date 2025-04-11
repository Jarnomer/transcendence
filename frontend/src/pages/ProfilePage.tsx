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

  return (
    <>
      <motion.div className="w-full h-full pb-10 flex flex-col items-center text-center">
        <RadialBackground avatar_url={user?.avatar_url}></RadialBackground>
        <AnimatePresence>
          {isOwnProfile && editProfile ? (
            <UserInformationForm
              user={user}
              setLoading={setLoading}
              setEditProfile={setEditProfile}
            ></UserInformationForm>
          ) : (
            <>
              <div className="w-full h-full gap-3 sm:flex">
                <div className="w-full sm:w-1/2">
                  <ProfileHeader
                    user={user}
                    isOwnProfile={isOwnProfile}
                    setLoading={setLoading}
                    setEditProfile={setEditProfile}
                    editProfile={editProfile}
                    sent={sent}
                  ></ProfileHeader>
                </div>
                <motion.div className="w-[80%] sm:w-1/2 h-full">
                  <FriendList
                    isOwnProfile={isOwnProfile}
                    friends={user.friends}
                    requests={user.friend_requests}
                    sents={sent}
                  />
                </motion.div>
              </div>
              <motion.div
                key="defaultSection"
                className="w-full mt-10  h-1/2 flex gap-4 flex-col md:flex-row  md:items-top  text-center"
              >
                <motion.div className="w-[80%] sm:w-1/2 h-full">
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
