import React from 'react';

import { useNavigate } from 'react-router-dom';

import { motion } from 'framer-motion';

import { useUser } from '@contexts';

import { FriendListType, FriendType, UserDataResponseType } from '@shared/types';

const friendListVariants = {
  visible: {
    transition: {
      staggerChildren: 0.1,
      delay: 0.4,
    },
  },
};

const friendVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -10 },
};

export const parentContainerVariants = {
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

type FriendListProps = {
  friends: FriendListType;
};

type FriendProps = {
  friend: FriendType;
};

type FriendsProps = {
  user: UserDataResponseType | null;
};

export const Friend: React.FC<FriendProps> = ({ friend }) => {
  return (
    <>
      <div className="image-container relative border h-[100px] w-[100px] overflow-hidden">
        <img
          className="object-cover w-full h-full"
          src={friend.avatar_url}
          alt={`${friend.display_name}'s profile picture`}
        />
      </div>
      <span className="text-xs font-medium text-secondary ">{friend.display_name}</span>
    </>
  );
};

export const FriendList: React.FC<FriendListProps> = ({ friends }) => {
  console.log('FRIENDS FROM FRIENDLIST: ', friends);
  const navigate = useNavigate();
  return friends && friends.length > 0 ? (
    <motion.ul
      className="flex flex-wrap gap-4 justify-start "
      variants={friendListVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
      transition={{ duration: 0.4 }}
      aria-label="friends"
    >
      {friends.map((friend) => (
        <motion.li
          className="hover:text-secondary backdrop-blur-md aspect-square w-[100px] flex-shrink-0 text-center"
          key={friend.user_id}
          onClick={() => navigate(`/profile/${friend.user_id}`)}
          variants={friendVariants}
        >
          <Friend friend={friend}></Friend>
        </motion.li>
      ))}
    </motion.ul>
  ) : (
    // add a placeholder friend if user has no friends
    <motion.div
      className=" aspect-square opacity-50 w-[100px] flex-shrink-0"
      variants={friendListVariants}
      aria-hidden="true"
    >
      <div className="text-center ">
        <div className="relative border h-[100px] w-[100px] overflow-hidden">
          <img
            className="object-cover grayscale w-full h-full opacity-50"
            src={'/uploads/default_avatar.png'}
          />
        </div>
        <span className="text-xs font-medium">{}</span>
      </div>
    </motion.div>
  );
};

export const Friends: React.FC<FriendsProps> = ({ user }) => {
  const { user: loggedInUser, friends: loggedInUserFriends } = useUser();

  if (!user) return;

  const isOwnProfile = user?.user_id === loggedInUser?.user_id;
  const friends = isOwnProfile ? loggedInUserFriends || [] : user?.friends || [];

  return (
    <motion.div
      className=""
      variants={parentContainerVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div className="h-[20px] bg-primary text-black text-sm">Friends</div>

      <span className={`text-xs pl-2 mb-2 text-secondary`}>
        {(friends && friends.length) || '0'} Friends
      </span>

      <FriendList friends={friends}></FriendList>
    </motion.div>
  );
};
