import React, { useCallback, useEffect, useState } from 'react';

import { motion } from 'framer-motion';

import { getBlockedUsers, unblockUser } from '@/services/friendService';

import { useUser } from '../../contexts/user/UserContext';
import { ClippedButton } from '../UI/buttons/ClippedButton';
import { ProfilePictureMedium } from '../UI/ProfilePictureMedium';
import { BackgroundGlow } from '../visual/BackgroundGlow';
import { ListSvgContainer } from '../visual/svg/containers/ListSvgContainer';

export const animationVariants = {
  initial: {
    clipPath: 'inset(0 0 100% 0)',
    opacity: 0,
  },
  animate: {
    clipPath: 'inset(0 0% 0 0)',
    opacity: 1,
    transition: { duration: 0.4, ease: 'easeInOut', delay: 0.5 },
  },
  exit: {
    clipPath: 'inset(0 100% 0 0)',
    opacity: 0,
    transition: { duration: 0.4, ease: 'easeInOut' },
  },
};

const listItemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -10 },
};

const containerVariants = {
  visible: {
    transition: {
      staggerChildren: 0.1, // Stagger items
      delay: 0.4,
    },
  },
};

export const UserSettings: React.FC = () => {
  const { userId } = useUser();
  const [myBlockedUsers, setMyBlockedUsers] = useState<any[]>([]);
  // const navigate = useNavigate();

  const handleSaveSettings = () => {
    console.log('---- Saving User settings -------');
  };

  const fetchBlockedUsers = useCallback(() => {
    if (!userId) return;
    getBlockedUsers()
      .then((data) => {
        setMyBlockedUsers(data);
      })
      .catch((err) => console.error('Failed to fetch blocked users:', err));
  }, [userId]);

  useEffect(() => {
    fetchBlockedUsers();
  }, [fetchBlockedUsers]);

  const handleUnblockUser = async (block_user_id: string) => {
    console.log('unblocking user :', block_user_id);
    await unblockUser(block_user_id);
  };

  return (
    <motion.div
      className="h-full min-h-[450px] relative glass-box mt-10 text-xs"
      variants={animationVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
    >
      <span
        aria-hidden="true"
        className="absolute top-0 left-0 bg-primary text-black w-full pointer-events-none"
      >
        <h1>User settings</h1>
      </span>
      <div className="w-full h-full relative overflow-hidden">
        <BackgroundGlow></BackgroundGlow>
        <div className="w-full h-full p-10">
          <div>
            <button>Delete user ?</button>
          </div>
          <h2>Unblock User</h2>
          <motion.ul
            className="pl-5 w-full h-full gap-3 overflow-y-scroll"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ duration: 0.4 }}
          >
            {myBlockedUsers.map((block) => (
              <motion.li
                className="my-1 hover:text-secondary h-[57px] w-[282px]"
                key={block.user_id}
                onClick={() => handleUnblockUser(block.user_id)}
                variants={listItemVariants}
              >
                <ListSvgContainer>
                  <div className="flex w-full h-full items-center gap-2">
                    <ProfilePictureMedium user={block}></ProfilePictureMedium>
                    <span className="text-xs font-medium">{block.display_name}</span>
                  </div>
                </ListSvgContainer>
              </motion.li>
            ))}
          </motion.ul>
        </div>
      </div>
      <div className="absolute bottom-0 right-0 p-4">
        <ClippedButton label={'Save'} onClick={() => handleSaveSettings()} />
      </div>
    </motion.div>
  );
};
