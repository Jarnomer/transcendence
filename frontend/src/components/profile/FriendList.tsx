import React, { useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { motion } from 'framer-motion';

import { NavIconButton } from '@components/UI/buttons/NavIconButton'; // Assuming this component is already in place

import { useUser } from '../../contexts/user/UserContext';
import { acceptFriendRequest, rejectFriendRequest } from '../../services/friendService';
import { ProfilePictureMedium } from '../UI/ProfilePictureMedium';
import { ListSvgContainer } from '../visual/svg/containers/ListSvgContainer';

export const listAnimationVariants = {
  initial: {
    clipPath: 'inset(0 0 100% 0)',
    opacity: 0,
  },
  animate: {
    clipPath: 'inset(0 0% 0 0)',
    opacity: 1,
    transition: { delay: 0.4, duration: 1.0, ease: 'easeInOut', delay: 0.5 },
  },
  exit: {
    clipPath: 'inset(0 100% 0 0)',
    opacity: 0,
    transition: { duration: 0.4, ease: 'easeInOut' },
  },
};

const containerVariants = {
  visible: {
    transition: {
      staggerChildren: 0.1, // Stagger items
      delay: 0.4,
    },
  },
};

const listItemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -10 },
};

type Friend = {
  user_id: string;
  display_name: string;
  avatar_url: string;
};

type FriendListProps = {
  friends: Friend[];
  requests: Friend[];
  sents: Friend[];
  isOwnProfile: boolean;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
};

export const animationVariants = {
  initial: {
    clipPath: 'inset(0 0 0 100% )',
    opacity: 0,
  },
  animate: {
    clipPath: 'inset(0 0% 0 0)',
    opacity: 1,
    transition: { duration: 0.4, ease: 'easeInOut', delay: 0.3 },
  },
  exit: {
    clipPath: 'inset(0 0 0 100%)',
    opacity: 0,
    transition: { duration: 0.4, ease: 'easeInOut' },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.1,
      type: 'tween',
      ease: 'easeOut',
    },
  }),
};

export const FriendRequests: React.FC<FriendListProps> = ({ requests, loading, setLoading }) => {
  const navigate = useNavigate();
  const { refetchUser } = useUser();

  const handleAcceptFriendClick = (event, sender_id: string) => {
    event.stopPropagation();
    acceptFriendRequest(sender_id)
      .then(() => {
        console.log('Friend request accepted');
        refetchUser();
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
      })
      .catch((error) => {
        console.error('Failed to reject friend request: ', error);
      });
  };

  return (
    <>
      {requests && requests.length > 0 ? (
        <motion.ul
          className="pl-5 w-full h-full overflow-y-scroll"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          transition={{ duration: 0.4 }}
        >
          {requests.map((friend) => (
            <motion.li
              className=""
              variants={listItemVariants}
              key={friend.user_id}
              onClick={() => navigate(`/profile/${friend.user_id}`)}
            >
              <div className="flex w-full h-full items-center gap-2 border-1 my-1 bg-primary/20 clipped-corner-bottom-right">
                <ProfilePictureMedium user={friend}></ProfilePictureMedium>

                <span className="text-xs font-medium">{friend.display_name}</span>

                <div className="ml-5 flex gap-1">
                  <NavIconButton
                    id={`accept-friend-${friend.user_id}`}
                    icon="checkCircle"
                    onClick={(event) => handleAcceptFriendClick(event, friend.user_id)}
                  />
                  <NavIconButton
                    id={`reject-friend-${friend.user_id}`}
                    icon="xCircle"
                    onClick={(event) => handleRejectFriendClick(event, friend.user_id)}
                  />
                </div>
              </div>
            </motion.li>
          ))}
        </motion.ul>
      ) : (
        <p className="text-gray-400 text-xs text-left">0 pending friend requests</p>
      )}
    </>
  );
};

export const Friends: React.FC<FriendListProps> = ({ friends }) => {
  const navigate = useNavigate();
  console.log('FRIENDS FROM FRIENDLIST: ', friends);
  return friends && friends.length > 0 ? (
    <motion.ul
      className="pl-5 w-full h-full gap-3 overflow-y-scroll"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
      transition={{ duration: 0.4 }}
    >
      {friends.map((friend) => (
        <motion.li
          className="my-1 hover:text-secondary h-[57px] w-[282px]"
          key={friend.user_id}
          onClick={() => navigate(`/profile/${friend.user_id}`)}
          variants={listItemVariants}
        >
          <ListSvgContainer>
            <div className="flex w-full h-full items-center gap-2">
              <ProfilePictureMedium user={friend}></ProfilePictureMedium>
              <span className="text-xs font-medium">{friend.display_name}</span>
            </div>
          </ListSvgContainer>
        </motion.li>
      ))}
    </motion.ul>
  ) : (
    <>
      <p className="text-gray-400 "></p>
      <motion.ul
        className="pl-5 w-full h-full gap-3 overflow-y-scroll text-grey-400"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
        transition={{ duration: 0.4 }}
      >
        <motion.li className="my-1 text-gray-500 h-[57px] w-[282px]" variants={listItemVariants}>
          <ListSvgContainer>
            <div className="flex w-full h-full items-center gap-2">
              <div className="opacity relative h-[50px] w-[50px]  overflow-hidden">
                <img className="object-cover w-full h-full grayscale" src={``} />
              </div>
              <span className="text-xs font-medium">mystery man</span>
            </div>
          </ListSvgContainer>
        </motion.li>
      </motion.ul>
    </>
  );
};

export const FriendList: React.FC<FriendListProps> = ({
  isOwnProfile,
  friends,
  requests,
  sents,
  loading,
  setLoading,
}) => {
  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'sent'>('friends');
  const navigate = useNavigate();
  const { refetchUser } = useUser();
  console.log('LOADING FROM FRIENDLIST: ', loading);

  if (loading) {
    return <h1>loading asd</h1>;
  }

  return (
    <motion.div variants={animationVariants} initial="initial" animate="animate" exit="exit">
      <div className=" w-full lg:w-1/2 h-[20px] bg-primary text-black text-sm">Friends</div>
      <motion.div className="">
        <div className="flex gap-4 p-2">
          <button
            onClick={() => setActiveTab('friends')}
            className={`text-xs ${activeTab === 'friends' ? 'text-secondary' : ''}`}
          >
            {(friends && friends.length) || '0'} Friends
          </button>
          {isOwnProfile ? (
            <>
              <button
                onClick={() => setActiveTab('requests')}
                className={` text-xs ${activeTab === 'requests' ? ' text-secondary' : ''}`}
              >
                Requests
              </button>
            </>
          ) : null}
        </div>

        <div className="flex flex-col gap-2">
          {activeTab === 'friends' ? (
            <Friends friends={friends}></Friends>
          ) : activeTab === 'requests' ? (
            <FriendRequests requests={requests}></FriendRequests>
          ) : null}
        </div>
      </motion.div>
    </motion.div>
  );
};
