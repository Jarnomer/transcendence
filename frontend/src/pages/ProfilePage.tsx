import React, { useEffect, useState } from 'react';

import { useParams } from 'react-router-dom';

import { AnimatePresence, motion } from 'framer-motion';

import { FriendList } from '@components/profile/FriendList.tsx';
import { RadialBackground } from '@components/profile/RadialBackground.tsx';

import { getUserData } from '@services/userService';

import { UserDataResponseType } from '@shared/types/userTypes';

import { NavIconButton } from '../components';
import { MatchHistory } from '../components/profile/MatchHistory';
import { ProfileHeader } from '../components/profile/ProfileHeader';
import { UserInformationForm } from '../components/signUp/UserInformationForm';
import { useUser } from '../contexts/user/UserContext';
import {
  acceptFriendRequest,
  getRequestsSent,
  rejectFriendRequest,
} from '../services/friendService';

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
  const { user: loggedInUser, refetchUser, refetchRequests } = useUser();
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

  const handleAcceptFriendClick = (event, sender_id: string) => {
    event.stopPropagation();
    acceptFriendRequest(sender_id)
      .then(() => {
        console.log('Friend request accepted');
        refetchUser();
        refetchRequests();
      })
      .catch((error) => {
        console.error('Failed to accept friend request: ', error);
      });
  };

  const handleRejectFriendClick = (event, sender_id: string) => {
    event.stopPropagation();
    rejectFriendRequest(sender_id)
      .then(() => {
        console.log('Friend request rejected');
        refetchUser();
        refetchRequests();
      })
      .catch((error) => {
        console.error('Failed to reject friend request: ', error);
      });
  };

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
      <motion.div className="w-full h-full flex flex-col justify-start relative">
        {loggedInUser?.friend_requests &&
        loggedInUser.friend_requests.some((req) => req.user_id === user?.user_id) ? (
          <div className="flex gap-2">
            <span className="p-1">{user?.display_name + ' sent you a friend request'}</span>
            <div className="ml-5 flex gap-1">
              <NavIconButton
                id={`accept-friend-${user?.user_id}`}
                icon="checkCircle"
                ariaLabel="accept friend request"
                onClick={(event) => handleAcceptFriendClick(event, user?.user_id)}
              />
              <NavIconButton
                id={`reject-friend-${user?.user_id}`}
                icon="xCircle"
                ariaLabel="reject friend request"
                onClick={(event) => handleRejectFriendClick(event, user?.user_id)}
              />
            </div>
          </div>
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
              <div>
                <div className="p-2 gap-2 grid   w-full ">
                  <div className="row-start-1 h-[200px] max-h-200px col-start-1 self-start flex-none">
                    <ProfileHeader
                      user={user}
                      isOwnProfile={isOwnProfile}
                      setLoading={setLoading}
                      setEditProfile={setEditProfile}
                      editProfile={editProfile}
                      sent={sent}
                    ></ProfileHeader>
                  </div>

                  <motion.div className="col-start-1 row-start-2 sm:row-start-1 sm:col-start-2 sm:row-span-2 flex-none">
                    <FriendList
                      isOwnProfile={isOwnProfile}
                      friends={user.friends}
                      requests={user.friend_requests}
                      sents={sent}
                      loading={loading}
                      setLoading={setLoading}
                    />
                  </motion.div>
                  <motion.div
                    key="defaultSection"
                    className="col-start-1 row-start-3 sm:row-start-2 sm:col-start-1 gap-3 sm:flex justify-start w-full flex-none"
                  >
                    <motion.div className="w-full">
                      <MatchHistory user={user} />
                    </motion.div>
                  </motion.div>
                </div>
              </div>
            </>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
};
