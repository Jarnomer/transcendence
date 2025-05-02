import React, { useEffect, useState } from 'react';

import { useParams } from 'react-router-dom';

import { AnimatePresence, motion } from 'framer-motion';

import { FriendList } from '@components/profile/FriendList.tsx';

import { getUserData } from '@services/userService';

import { UserDataResponseType } from '@shared/types/userTypes';

import { MatchHistory } from '../components/profile/MatchHistory';
import { ProfileHeader } from '../components/profile/ProfileHeader';
import { UserInformationForm } from '../components/signUp/UserInformationForm';

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
  const [loading, setLoading] = useState(false);
  const [editProfile, setEditProfile] = useState<boolean>(false);

  const { userId } = useParams<{ userId: string }>();

  useEffect(() => {
    setLoading(true);
    if (!userId) return;

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
  }, [userId]);

  if (loading) {
    return <div className="text-center mt-10 text-lg">Loading...</div>;
  }

  if (!user && !loading) {
    return <div className="text-center mt-10 text-lg text-red-500">Failed to load user data.</div>;
  }

  return (
    <motion.div className="w-full h-full flex flex-col items-center justify-start relative">
      <AnimatePresence>
        {editProfile ? (
          <UserInformationForm
            user={user}
            setLoading={setLoading}
            setEditProfile={setEditProfile}
          ></UserInformationForm>
        ) : (
          <>
            <div className="p-2 gap-4 grid w-full  grid-cols-1 md:grid-cols-2">
              <div className="row-start-1 h-[200px] max-h-200px col-start-1 self-start flex-none">
                <ProfileHeader
                  user={user}
                  setLoading={setLoading}
                  setEditProfile={setEditProfile}
                  editProfile={editProfile}
                ></ProfileHeader>
              </div>

              <motion.div className="col-start-1 row-start-2 sm:row-start-1 sm:col-start-2 sm:row-span-2 flex-none">
                <FriendList
                  user={user}
                  requests={user.friend_requests}
                  loading={loading}
                  setLoading={setLoading}
                />
              </motion.div>
              <motion.div
                key="match history"
                className="col-start-1 row-start-3 sm:row-start-2 sm:col-start-1 gap-3 sm:flex justify-start w-full h-full"
              >
                <motion.div className="w-full">
                  <MatchHistory user={user} />
                </motion.div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
