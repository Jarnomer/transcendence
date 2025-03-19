import React, { useEffect, useState } from 'react';

import { useParams } from 'react-router-dom';

import { AnimatePresence, motion } from 'framer-motion';

import { FriendList } from '@components/profile/FriendList.tsx';
import { MatchHistory } from '@components/profile/MatchHistory';
import { RadialBackground } from '@components/profile/RadialBackground.tsx';

import { getUserData } from '@services/userService';

import { EditProfile } from '../components/profile/EditProfile';
import { ProfileHeader } from '../components/profile/ProfileHeader';
import { useUser } from '../contexts/user/UserContext';

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
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [editProfile, setEditProfile] = useState<boolean>(false);
  const [isExiting, setIsExiting] = useState(false);

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
    if (!loggedInUser || !user?.avatar_url) return;
    if (user.user_id === loggedInUser?.user_id && !user.display_name) {
      setEditProfile(true);
    }
  }, [user]);

  const handleExitComplete = (isExitAnimation: boolean) => {
    if (isExitAnimation) {
      console.log('is exiting set to true');
      setIsExiting(true); // Set a flag to indicate exit completion
    }
  };

  if (loading) {
    return <div className="text-center mt-10 text-lg">Loading...</div>;
  }

  if (!user && !loading) {
    return <div className="text-center mt-10 text-lg text-red-500">Failed to load user data.</div>;
  }

  return (
    <>
      <motion.div className="w-full h-full flex flex-col items-center p-6 text-center">
        <RadialBackground avatar_url={user.avatar_url}></RadialBackground>
        <ProfileHeader
          user={user}
          isOwnProfile={isOwnProfile}
          setLoading={setLoading}
          setEditProfile={setEditProfile}
          editProfile={editProfile}
        ></ProfileHeader>
        <AnimatePresence>
          {isOwnProfile && editProfile ? (
            <motion.div
              key="editSection"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.4 }}
              onAnimationComplete={() => handleExitComplete(true)} // <-- Handle exit animation completion
            >
              <EditProfile setLoading={setLoading} user={user} setEditProfile={setEditProfile} />
            </motion.div>
          ) : (
            <motion.div
              key="defaultSection"
              className="w-full flex gap-4 flex-col md:flex-row items-top justify-center text-center"
              // variants={animationVariants}
              // initial="initial"
              // animate="animate"
              // exit="exit"
              onAnimationComplete={() => handleExitComplete(true)} // <-- Handle exit animation completion
            >
              <motion.div>
                <FriendList
                  isOwnProfile={isOwnProfile}
                  friends={user.friends}
                  requests={user.friend_requests}
                />
              </motion.div>
              <motion.div>
                <MatchHistory user={user} />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
};
