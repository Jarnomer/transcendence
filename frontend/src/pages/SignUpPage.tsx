import React, { useEffect, useState } from 'react';

import { AnimatePresence, motion } from 'framer-motion';

import { getUserData } from '@services/userService';

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

export const SignUpPage: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [sent, setSent] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [editProfile, setEditProfile] = useState<boolean>(false);
  const [isExiting, setIsExiting] = useState(false);

  const { user: loggedInUser } = useUser();
  const userId = loggedInUser?.user_id;

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
      {!loading ? (
        <motion.div className="w-full h-full flex flex-col items-center md:p-6 text-center">
          <AnimatePresence>
            <motion.div
              key="editSection"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.4 }}
              onAnimationComplete={() => handleExitComplete(true)} // <-- Handle exit animation completion
            >
              <h3 className="text-lg font-bold">Create Profile</h3>

              <UserInformationForm
                loading={loading}
                setLoading={setLoading}
                user={user}
                setEditProfile={setEditProfile}
              />
            </motion.div>
          </AnimatePresence>
        </motion.div>
      ) : null}
    </>
  );
};
