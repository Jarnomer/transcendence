import React, { useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { motion } from 'framer-motion';

import { NavIconButton } from '@components/UI/buttons/NavIconButton'; // Assuming this component is already in place

import { useUser } from '../../contexts/user/UserContext';
import { acceptFriendRequest, rejectFriendRequest } from '../../services/friendService';

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

export const FriendRequests: React.FC<FriendListProps> = ({ requests }) => {
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
        <ul className="">
          {requests.map((friend) => (
            <li
              key={friend.user_id}
              onClick={() => navigate(`/profile/${friend.user_id}`)}
              className="cursor-pointer border-1 bg-green"
            >
              <div className="flex items-center gap-3">
                <img className="w-10 h-10 " src={friend.avatar_url} alt={friend.display_name} />
                <span className="text-md font-medium">{friend.display_name}</span>

                <>
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
                </>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-400 ">0 pending friend requests</p>
      )}
    </>
  );
};

export const Friends: React.FC<FriendListProps> = ({ friends }) => {
  const navigate = useNavigate();
  return friends && friends.length > 0 ? (
    <ul className="flex w-full flex-wrap gap-2">
      {friends.map((friend) => (
        <li
          key={friend.user_id}
          onClick={() => navigate(`/profile/${friend.user_id}`)}
          className="aspect-square w-[100px] cursor-pointer  bg-green"
        >
          <div className="flex flex-col  justify-centeritems-center gap-3">
            <img
              className="w-full object-contain"
              src={friend.avatar_url}
              alt={friend.display_name}
            />
          </div>
          <span className="text-xs font-medium">{friend.display_name}</span>
        </li>
      ))}
    </ul>
  ) : (
    <p className="text-gray-400 "></p>
  );
};

export const FriendList: React.FC<FriendListProps> = ({
  isOwnProfile,
  friends,
  requests,
  sents,
}) => {
  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'sent'>('friends');
  const navigate = useNavigate();
  const { refetchUser } = useUser();

  return (
    <motion.div variants={animationVariants} initial="initial" animate="animate" exit="exit">
      <div className="clipped-corner w-full h-[20px] bg-primary text-black text-sm">Friends</div>
      <motion.div className=" p-4 glass-box">
        <div className="flex gap-4 mb-4">
          <button
            onClick={() => setActiveTab('friends')}
            className={`pb-2 text-sm ${
              activeTab === 'friends' ? 'border-b-2 border-primary' : 'text-gray-400'
            }`}
          >
            {friends.length} Friends
          </button>
          {isOwnProfile ? (
            <>
              <button
                onClick={() => setActiveTab('requests')}
                className={`pb-2 text-sm ${
                  activeTab === 'requests' ? 'border-b-2 border-primary' : 'text-gray-400'
                }`}
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
